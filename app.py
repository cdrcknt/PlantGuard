from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import torch
import torchvision.transforms as transforms
import torch.nn as nn
import io
import os
from PIL import Image
from torchvision import models
import logging

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Set environment
ENVIRONMENT = os.getenv('FLASK_ENV', 'development')

# Model configuration
MODEL_PATH = os.getenv('MODEL_PATH', 'plantguard_model.pth')
CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', '0.6'))
IMAGE_SIZE = 128

# Class names for predictions
CLASS_NAMES = ["Rust", "Powdery", "Healthy"]

# Disease information database
DISEASE_INFO = {
    "Healthy": {
        "icon": "🌿",
        "severity": "none",
        "description": "Your plant looks healthy and shows no signs of disease.",
        "causes": [],
        "recommendations": [
            "Continue your current care routine",
            "Maintain good watering and sunlight practices",
            "Monitor the plant for any changes",
            "Ensure proper drainage to prevent future issues"
        ]
    },
    "Powdery": {
        "icon": "🍂",
        "severity": "moderate",
        "description": "Your plant is affected by Powdery Mildew, a common fungal disease that appears as white powdery spots on leaves.",
        "causes": [
            "High humidity with poor air circulation",
            "Overcrowding of plants",
            "Overhead watering",
            "Shaded areas with limited sunlight"
        ],
        "recommendations": [
            "Improve air circulation around the plant",
            "Reduce humidity and avoid overhead watering",
            "Remove affected leaves carefully",
            "Apply fungicide specifically for powdery mildew",
            "Consider using neem oil or baking soda solution as organic treatment"
        ]
    },
    "Rust": {
        "icon": "🍁",
        "severity": "high",
        "description": "Your plant shows signs of Rust, a fungal disease characterized by orange-brown pustules on leaf surfaces.",
        "causes": [
            "Prolonged wet conditions on leaves",
            "Poor air circulation",
            "Infected plant debris nearby",
            "High humidity environments"
        ],
        "recommendations": [
            "Remove and destroy infected plant parts immediately",
            "Apply appropriate fungicide treatment",
            "Avoid wetting leaves when watering",
            "Ensure good air circulation between plants",
            "Clean up fallen leaves and debris regularly"
        ]
    }
}

# Initialize model as None
model = None


def load_model():
    """Load the ResNet18 model with custom classification head."""
    global model
    
    try:
        # Load ResNet18 with pretrained weights
        model = models.resnet18(weights='IMAGENET1K_V1')
        
        # Modify the final layer for 3-class classification
        model.fc = nn.Linear(model.fc.in_features, len(CLASS_NAMES))
        
        # Load custom weights if available
        if os.path.exists(MODEL_PATH):
            model.load_state_dict(
                torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=True)
            )
            logger.info(f"Custom model weights loaded from {MODEL_PATH}")
        else:
            logger.warning(f"Model file {MODEL_PATH} not found. Using pretrained weights only.")
        
        model.eval()
        logger.info("Model initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        model = None
        return False


# Define image transformation pipeline
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def validate_image(file):
    """Validate uploaded image file."""
    if not file:
        return False, "No file uploaded"
    
    if file.filename == '':
        return False, "No file selected"
    
    # Check file extension
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    
    if ext not in allowed_extensions:
        return False, f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
    
    return True, "Valid"


def process_image(file):
    """Process and transform the uploaded image."""
    try:
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Log image info
        logger.debug(f"Image processed: {image.size}, mode: {image.mode}")
        
        # Apply transformations
        tensor = transform(image).unsqueeze(0)
        return tensor, None
        
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return None, str(e)


@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html")


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "environment": ENVIRONMENT
    })


@app.route("/disease-info", methods=["GET"])
def get_disease_info():
    """Get information about all detectable diseases."""
    return jsonify(DISEASE_INFO)


@app.route("/predict", methods=["POST"])
def predict():
    """Predict plant disease from uploaded image."""
    
    # Check if model is loaded
    if model is None:
        logger.error("Model not loaded")
        return jsonify({
            "success": False,
            "prediction": "Error",
            "message": "Model not available. Please try again later.",
            "confidence": 0.0
        }), 503
    
    # Check if image file is in request
    if 'image' not in request.files:
        logger.error("No image file in request")
        return jsonify({
            "success": False,
            "prediction": "Error",
            "message": "No image file provided",
            "confidence": 0.0
        }), 400
    
    file = request.files['image']
    
    # Validate the file
    is_valid, message = validate_image(file)
    if not is_valid:
        logger.error(f"Invalid file: {message}")
        return jsonify({
            "success": False,
            "prediction": "Error",
            "message": message,
            "confidence": 0.0
        }), 400
    
    logger.debug(f"Processing file: {file.filename}")
    
    try:
        # Process the image
        image_tensor, error = process_image(file)
        if error:
            return jsonify({
                "success": False,
                "prediction": "Error",
                "message": f"Failed to process image: {error}",
                "confidence": 0.0
            }), 400
        
        # Perform inference
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
            
            # Get all class probabilities
            all_probs = probabilities[0].tolist()
        
        confidence_value = confidence.item()
        predicted_class = CLASS_NAMES[predicted_idx.item()]
        
        logger.info(f"Prediction: {predicted_class}, Confidence: {confidence_value:.2%}")
        
        # Check confidence threshold
        if confidence_value < CONFIDENCE_THRESHOLD:
            logger.warning(f"Low confidence prediction: {confidence_value:.2%}")
            return jsonify({
                "success": True,
                "prediction": "Uncertain",
                "message": "The image could not be confidently classified. Please ensure it's a clear plant leaf image.",
                "confidence": confidence_value,
                "all_probabilities": {
                    CLASS_NAMES[i]: round(prob, 4) for i, prob in enumerate(all_probs)
                }
            })
        
        # Get disease information
        disease_data = DISEASE_INFO.get(predicted_class, {})
        
        return jsonify({
            "success": True,
            "prediction": predicted_class,
            "confidence": confidence_value,
            "icon": disease_data.get("icon", "🌱"),
            "severity": disease_data.get("severity", "unknown"),
            "description": disease_data.get("description", ""),
            "causes": disease_data.get("causes", []),
            "recommendations": disease_data.get("recommendations", []),
            "all_probabilities": {
                CLASS_NAMES[i]: round(prob, 4) for i, prob in enumerate(all_probs)
            }
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "prediction": "Error",
            "message": "An unexpected error occurred during analysis",
            "confidence": 0.0
        }), 500


# Load model on startup
load_model()


if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    debug = ENVIRONMENT == 'development'
    
    logger.info(f"Starting PlantGuard in {ENVIRONMENT} mode on port {port}")
    app.run(debug=debug, host='0.0.0.0', port=port)

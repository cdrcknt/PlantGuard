from flask import Flask, request, jsonify, render_template
from PIL import Image
import torch
import torchvision.transforms as transforms
import torch.nn as nn
import io
from torchvision import models

# Initialize Flask app
app = Flask(__name__)

# Load ResNet18 model
model = models.resnet18(weights='IMAGENET1K_V1')  # Load the pre-trained ResNet18 model
model.fc = nn.Linear(model.fc.in_features, 3)  # Modify the final layer for your classification

# Load the saved model weights from local path
model.load_state_dict(torch.load("plantguard_model.pth", map_location=torch.device('cpu'), weights_only=True))  # Ensure correct loading on CPU or GPU
model.eval()  # Set the model to evaluation mode

# Define image transformation (same as during training)
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
])

@app.route("/")
def index():
    return render_template("index.html")  # Render the HTML template

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get the image from the request
        file = request.files["image"]
        image = Image.open(io.BytesIO(file.read())).convert("RGB")

        # Basic validation: Check if image size is reasonable for a plant
        width, height = image.size
        if width < 50 or height < 50:  # Arbitrary size check
            return jsonify({"prediction": "Invalid Image", "confidence": 0.0})

        image = transform(image).unsqueeze(0)  # Add batch dimension

        # Perform inference
        with torch.no_grad():
            outputs = model(image)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)  # Get class probabilities
            confidence, predicted = torch.max(probabilities, 1)  # Get the highest probability

        # Define class names
        class_names = ["Rust", "Powdery", "Healthy"]

        # Confidence threshold check
        confidence_threshold = 0.6
        if confidence < confidence_threshold:
            return jsonify({"prediction": "Invalid Image", "confidence": confidence.item()})

        # Return valid prediction
        predicted_class = class_names[predicted.item()]
        return jsonify({"prediction": predicted_class, "confidence": confidence.item()})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"prediction": "Error", "confidence": 0.0}), 500

if __name__ == "__main__":
       app.run(host="0.0.0.0", port=5000)  # Run on all network interfaces

<p align="center">
  <img src="images/plantguard_logo.png" alt="PlantGuard" width="100%">
</p>

<h1 align="center">🌿 PlantGuard</h1>

<p align="center">
  <strong>Machine Learning Plant Disease Detection</strong><br>
  Harness the power of computer vision and ResNet-18 CNN to analyze plant leaves and detect diseases in real-time
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/PyTorch-2.0+-ee4c2c?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch">
  <img src="https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="License">
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-model-details">Model</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

<p align="center">
  <img src="images/plantguard_NeutralIntelligence.png" alt="Neural Intelligence" width="100%">
</p>

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>🔬 Machine Learning Detection</h3>
      <p>Uses a ResNet-18 convolutional neural network trained on thousands of plant images to accurately identify diseases using computer vision.</p>
    </td>
    <td width="50%">
      <h3>⚡ Real-Time Analysis</h3>
      <p>Get instant results with confidence scores and detailed recommendations within seconds.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📱 Mobile-Friendly</h3>
      <p>Responsive design with camera capture support. Works seamlessly on phones, tablets, and desktops.</p>
    </td>
    <td width="50%">
      <h3>🎯 High Accuracy</h3>
      <p>Trained on quality datasets from Kaggle with optimized preprocessing for reliable predictions.</p>
    </td>
  </tr>
</table>

---

<p align="center">
  <img src="images/plantguard_SimpleFastAccurate.png" alt="Simple Fast Accurate" width="100%">
</p>

## 🔄 How It Works

| Step | Action | Description |
|:----:|:------:|:------------|
| **1** | 📸 **Snap** | Take a photo or upload an image of a plant leaf |
| **2** | 🧠 **Scan** | Our neural network analyzes the image through multiple CNN layers |
| **3** | ✅ **Save** | Get your diagnosis with confidence score and care recommendations |

---

<p align="center">
  <img src="images/plantguard_PrecisionDiagnosis.png" alt="Precision Diagnosis" width="100%">
</p>

## 🎯 Detectable Conditions

| Condition | Icon | Description |
|:----------|:----:|:------------|
| **Healthy** | 🌿 | Plant shows no signs of disease |
| **Powdery Mildew** | 🍂 | Fungal disease appearing as white powdery spots |
| **Rust** | 🍁 | Fungal disease with orange-brown pustules |

---

## 🚀 Installation

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- **Trained model file** (see below)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/cdrcknt/PlantGuard.git
cd PlantGuard

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

The app will start at `http://localhost:5000` 🎉

### ⚠️ Important: Model File Required

> **Note:** The trained model file (`plantguard_model.pth`) is **not included** in this repository. You need to train your own model or obtain the weights separately.

**To train your own model:**

1. Collect a plant disease dataset from platforms like [Kaggle](https://www.kaggle.com/datasets), [Roboflow](https://roboflow.com/), or [Hugging Face Datasets](https://huggingface.co/datasets).
2. Train a ResNet-18 model with 3 output classes (Healthy, Powdery, Rust) using your preferred machine learning framework.
3. Save the weights as `plantguard_model.pth` in the project root.

**Model specifications:**
- Architecture: ResNet-18 with modified final layer (`fc: 512 → 3`)
- Input size: 128×128 pixels
- Classes: `["Rust", "Powdery", "Healthy"]`

### Environment Variables

| Variable | Default | Description |
|:---------|:--------|:------------|
| `PORT` | `5000` | Server port |
| `FLASK_ENV` | `development` | Environment mode |
| `MODEL_PATH` | `plantguard_model.pth` | Path to model weights |
| `CONFIDENCE_THRESHOLD` | `0.6` | Minimum confidence for predictions |

---

## 🧠 Model Details

<table>
  <tr>
    <td><strong>Architecture</strong></td>
    <td>ResNet-18 (Modified)</td>
  </tr>
  <tr>
    <td><strong>Framework</strong></td>
    <td>PyTorch</td>
  </tr>
  <tr>
    <td><strong>Input Size</strong></td>
    <td>128 × 128 pixels</td>
  </tr>
  <tr>
    <td><strong>Output Classes</strong></td>
    <td>3 (Healthy, Powdery, Rust)</td>
  </tr>
  <tr>
    <td><strong>Dataset</strong></td>
    <td>Kaggle Plant Disease Dataset</td>
  </tr>
  <tr>
    <td><strong>Preprocessing</strong></td>
    <td>Resize, Normalize (ImageNet stats)</td>
  </tr>
</table>

### Model Architecture

```
Input Image (128×128×3)
        ↓
   ResNet-18 Backbone
   (Pretrained on ImageNet)
        ↓
   Global Average Pooling
        ↓
   Fully Connected (512 → 3)
        ↓
   Softmax Activation
        ↓
Output: [Healthy, Powdery, Rust] probabilities
```

---

## 📁 Project Structure

```
PlantGuard/
├── 📄 app.py                 # Flask application & API endpoints
├── 📄 requirements.txt       # Python dependencies
├── 🔒 plantguard_model.pth   # Trained model weights (NOT INCLUDED - train your own)
├── 📄 Procfile              # Heroku deployment config
├── 📄 vercel.json           # Vercel deployment config
│
├── 📁 static/
│   ├── 📄 style.css         # Application styles
│   ├── 📄 script.js         # Frontend JavaScript
│   └── 📁 images/           # Banner images
│
├── 📁 templates/
│   └── 📄 index.html        # Main HTML template
│
└── 📁 images/               # README assets
    ├── 🖼️ plantguard_logo.png
    ├── 🖼️ plantguard_NeutralIntelligence.png
    ├── 🖼️ plantguard_SimpleFastAccurate.png
    └── 🖼️ plantguard_PrecisionDiagnosis.png
```

---

## 🔌 API Endpoints

### `GET /`
Returns the main application page.

### `GET /health`
Health check endpoint for monitoring.

```json
{
  "status": "healthy",
  "model_loaded": true,
  "environment": "development"
}
```

### `POST /predict`
Analyze a plant image for diseases.

**Request:** `multipart/form-data` with `image` file

**Response:**
```json
{
  "success": true,
  "prediction": "Healthy",
  "confidence": 0.95,
  "icon": "🌿",
  "severity": "none",
  "description": "Your plant looks healthy...",
  "recommendations": ["Continue regular care...", "..."],
  "all_probabilities": {
    "Healthy": 0.95,
    "Powdery": 0.03,
    "Rust": 0.02
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Commit** your changes: `git commit -m 'Add amazing feature'`
5. **Push** to the branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Ideas for Contribution

- 🌱 Add more plant disease classes
- 🌍 Add multi-language support
- 📊 Improve model accuracy
- 🎨 UI/UX enhancements
- 📱 Native mobile app wrapper
- 🧪 Add unit tests

---

## 📜 License

This project is open-source and available under the **MIT License**.

---

## 👨‍💻 Developer

<table>
  <tr>
    <td align="center">
      <strong>Cedric Kent Centeno</strong><br>
      <a href="https://github.com/cdrcknt">@cdrcknt</a>
    </td>
  </tr>
</table>

---

## 🙏 Acknowledgements

- **PyTorch** - Deep learning framework
- **Flask** - Web framework
- **Kaggle** - Plant disease dataset
- **ResNet** - Model architecture by Microsoft Research

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge" alt="Made with love">
  <img src="https://img.shields.io/badge/Powered%20by-PyTorch-ee4c2c?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch">
</p>

<p align="center">
  <strong>🌿 PlantGuard — Protecting plants with the power of machine learning and computer vision 🌿</strong>
</p>

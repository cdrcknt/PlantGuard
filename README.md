# PlantGuard

PlantGuard is a mobile application that analyzes plant images to detect diseases and classify their health status. Using machine learning, the app identifies whether a plant is healthy or affected by common plant diseases such as powdery mildew and rust.

## Features

- **Disease Detection:** Analyzes images of plants and detects if they are affected by powdery mildew or rust.
- **Health Classification:** Classifies the plant as either healthy, powdery, or rust-affected.
- **User-Friendly Interface:** Designed with a simple UI to make the analysis process quick and efficient.
- **Real-time Results:** Provides immediate feedback on the plant's health status upon image upload.

## Installation

### Prerequisites

Before you can run PlantGuard locally, ensure that you have the following installed:

- Python 3.x
- TensorFlow or PyTorch (for machine learning models)
- Required dependencies (listed in `requirements.txt`)

### Steps to Install

1. Clone this repository to your local machine:

    ```bash
    git clone https://github.com/cdrcknt/PlantGuard.git
    ```

2. Navigate into the project directory:

    ```bash
    cd PlantGuard
    ```

3. Install the required dependencies:

    ```bash
    pip install -r requirements.txt
    ```

4. Run the application locally:

    ```bash
    python app.py
    ```

## Usage

1. Open the app and take or upload a photo of a plant.
2. The app will analyze the image and classify the plant's health.
3. The result will be shown as either "Healthy," "Powdery," or "Rust."

## Machine Learning Model

The app uses a trained machine learning model to classify plant diseases. The model was trained using a dataset of labeled plant images and has been optimized for the accurate detection of common plant diseases.

## Contributing

We welcome contributions to improve PlantGuard. If you'd like to help, please fork this repository and submit a pull request with your changes.

### Steps to Contribute

1. Fork the repository
2. Clone your forked repository to your local machine
3. Create a new branch (`git checkout -b feature-branch`)
4. Make your changes
5. Commit your changes (`git commit -am 'Add new feature'`)
6. Push to the branch (`git push origin feature-branch`)
7. Submit a pull request

## License

PlantGuard is open-source and available under the [MIT License](LICENSE).

## Acknowledgements

- This project uses [TensorFlow](https://www.tensorflow.org/) for machine learning.
- The plant disease dataset was sourced from [Dataset Source](kaggle.com).

## Developers

- **Cedric Kent Centeno**

## Contact

For any inquiries or feedback, feel free to open an issue on the [GitHub repository](https://github.com/cdrcknt/PlantGuard).

---

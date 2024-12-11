document.addEventListener('DOMContentLoaded', () => {
    const uploadBox = document.getElementById('uploadBox');
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const resultSection = document.getElementById('resultSection');
    const diseaseType = document.getElementById('diseaseType');
    const diseaseDescription = document.getElementById('diseaseDescription');
    const confidenceLevel = document.getElementById('confidenceLevel');
    const recommendations = document.getElementById('recommendations');

    const confidenceThreshold = 0.6; // Set a threshold for confidence (60%)

    // Click to upload
    uploadBox.addEventListener('click', () => {
        imageUpload.click();
    });

    // Drag and drop functionality
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // File selection
    imageUpload.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Handle uploaded files
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) { // Ensure it's an image file
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedImage.src = e.target.result;
                    uploadedImage.classList.remove('hidden');
                    analyzeBtn.classList.remove('hidden');
                    removeImageBtn.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        }
    }

    // Analyze button functionality
    analyzeBtn.addEventListener('click', () => {
        const file = imageUpload.files[0];

        if (!file) {
            alert("Please upload an image first!");
            return;
        }

        // Prepare the file for the Flask API
        const formData = new FormData();
        formData.append('image', file);

        // Show loading state
        resultSection.classList.remove('hidden');
        diseaseType.textContent = "Analyzing...";
        diseaseDescription.textContent = "Please wait while we process the image...";
        recommendations.innerHTML = "";

        fetch("http://192.168.1.8:5000/predict", {  // Replace with the actual local IP
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.prediction === "Invalid Image") {
                diseaseType.textContent = "Invalid Image";
                diseaseDescription.textContent = "The uploaded image does not appear to be a plant.";
                recommendations.innerHTML = "";
                confidenceLevel.textContent = ""; // Clear confidence level for invalid images
            } else {
                const results = {
                    'Healthy': {
                        icon: '🌿',
                        description: 'Your plant looks healthy and shows no signs of disease.',
                        recommendations: [
                            'Continue your current care routine.',
                            'Maintain good watering and sunlight practices.',
                            'Monitor the plant for any changes.'
                        ]
                    },
                    'Powdery': {
                        icon: '🍄',
                        description: 'Your plant is affected by Powdery Mildew, a common fungal disease.',
                        recommendations: [
                            'Improve air circulation around the plant.',
                            'Reduce humidity and avoid overhead watering.',
                            'Use fungicide specifically for powdery mildew.'
                        ]
                    },
                    'Rust': {
                        icon: '🦠',
                        description: 'Your plant shows signs of Rust, a fungal plant disease.',
                        recommendations: [
                            'Remove and destroy infected plant parts.',
                            'Apply appropriate fungicide.',
                            'Avoid wetting leaves when watering.'
                        ]
                    }
                };

                const result = results[data.prediction];

                diseaseType.textContent = data.prediction;
                diseaseDescription.textContent = result.description;

                // Handle confidence level
                const confidence = data.confidence;
                if (confidence >= confidenceThreshold) {
                    confidenceLevel.textContent = `Confidence Level: ${Math.round(confidence * 100)}%`;
                } else {
                    confidenceLevel.textContent = "Confidence Level: Low (below threshold)";
                }

                recommendations.innerHTML = "";

                result.recommendations.forEach(rec => {
                    const p = document.createElement('p');
                    p.textContent = `• ${rec}`;
                    recommendations.appendChild(p);
                });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            diseaseType.textContent = "Error";
            diseaseDescription.textContent = "An error occurred while processing the image.";
        });
    });

    // Remove Image button functionality
    removeImageBtn.addEventListener('click', () => {
        uploadedImage.classList.add('hidden');
        analyzeBtn.classList.add('hidden');
        removeImageBtn.classList.add('hidden');
        resultSection.classList.add('hidden');
        imageUpload.value = "";  // Clear the file input
    });
});

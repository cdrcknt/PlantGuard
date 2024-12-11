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
    const loadingSpinner = document.getElementById('loadingSpinner');

    const confidenceThreshold = 0.6; // Set a threshold for confidence
    const apiUrl = `${window.location.origin}/predict`; // Use dynamic URL

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
                    clearResults(); // Clear previous results
                };
                reader.readAsDataURL(file);
            } else {
                alert("Please upload a valid image file.");
            }
        }
    }

    // Clear previous analysis results
    function clearResults() {
        diseaseType.textContent = "";
        diseaseDescription.textContent = "";
        confidenceLevel.textContent = "";
        recommendations.innerHTML = "";
        resultSection.classList.add('hidden');
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

        console.log("Sending request to:", apiUrl);

        // Show loading state
        loadingSpinner.classList.add('loading');
        clearResults(); // Clear previous results
        resultSection.classList.remove('hidden');
        diseaseType.textContent = "Analyzing...";
        diseaseDescription.textContent = "Please wait while we process the image...";

        fetch(apiUrl, {
            method: "POST",
            body: formData
        })
        .then(response => {
            loadingSpinner.classList.remove('loading'); // Hide spinner
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            displayResults(data);
        })
        .catch(error => {
            loadingSpinner.classList.remove('loading'); // Hide spinner
            console.error("Error occurred while processing the image:", error);
            showError("An error occurred while processing the image. Please try again.");
        });
    });

    // Display results based on response
    function displayResults(data) {
        const confidence = data.confidence;

        if (data.prediction === "Invalid Image") {
            diseaseType.textContent = "Invalid Image";
            diseaseDescription.textContent = "The uploaded image does not appear to be a plant.";
            confidenceLevel.textContent = ""; // Clear confidence level
        } else {
            diseaseType.textContent = data.prediction;
            diseaseDescription.textContent = getDescription(data.prediction);
            
            // Handle confidence level
            if (confidence >= confidenceThreshold) {
                confidenceLevel.textContent = `Confidence Level: ${Math.round(confidence * 100)}%`;
                confidenceLevel.style.color = "green"; // High confidence
            } else {
                confidenceLevel.textContent = "Confidence Level: Low (below threshold)";
                confidenceLevel.style.color = "red"; // Low confidence
            }

            recommendations.innerHTML = getRecommendations(data.prediction);
        }
    }

    // Get description based on prediction
    function getDescription(prediction) {
        const descriptions = {
            'Healthy': 'Your plant looks healthy and shows no signs of disease.',
            'Powdery': 'Your plant is affected by Powdery Mildew, a common fungal disease.',
            'Rust': 'Your plant shows signs of Rust, a fungal plant disease.',
        };
        return descriptions[prediction] || 'Unknown condition.';
    }

    // Get recommendations based on prediction
    function getRecommendations(prediction) {
        const recommendationsList = {
            'Healthy': [
                'Continue your current care routine.',
                'Maintain good watering and sunlight practices.',
                'Monitor the plant for any changes.'
            ],
            'Powdery': [
                'Improve air circulation around the plant.',
                'Reduce humidity and avoid overhead watering.',
                'Use fungicide specifically for powdery mildew.'
            ],
            'Rust': [
                'Remove and destroy infected plant parts.',
                'Apply appropriate fungicide.',
                'Avoid wetting leaves when watering.'
            ]
        };

        return recommendationsList[prediction]?.map(rec => `<p>• ${rec}</p>`).join('') || '';
    }

    // Show error message
    function showError(message) {
        diseaseType.textContent = "Error";
        diseaseDescription.textContent = message;
        confidenceLevel.textContent = ""; // Clear confidence level
    }

    // Remove Image button functionality
    removeImageBtn.addEventListener('click', () => {
        uploadedImage.classList.add('hidden');
        analyzeBtn.classList.add('hidden');
        removeImageBtn.classList.add('hidden');
        resultSection.classList.add('hidden');
        imageUpload.value = "";  // Clear the file input
        clearResults(); // Clear results
    });
});
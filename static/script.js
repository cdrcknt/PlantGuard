/**
 * PlantGuard - Deep Learning Plant Disease Detection
 * Beautiful onboarding + main application
 */

(function() {
    'use strict';

    // ==========================================================================
    // Configuration
    // ==========================================================================
    const CONFIG = {
        apiUrl: `${window.location.origin}/predict`,
        maxFileSize: 10 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'],
        autoSlideInterval: 5000
    };

    const DISEASE_ICONS = {
        'Healthy': '🌿',
        'Powdery': '🍂',
        'Rust': '🍁',
        'Uncertain': '❓',
        'Error': '⚠️'
    };

    const SEVERITY_MAP = {
        'none': { text: 'No Issues', class: 'severity-none' },
        'moderate': { text: 'Moderate', class: 'severity-moderate' },
        'high': { text: 'High Severity', class: 'severity-high' },
        'unknown': { text: 'Unknown', class: '' }
    };

    // ==========================================================================
    // State
    // ==========================================================================
    let currentSlide = 0;
    let autoSlideTimer = null;
    let currentFile = null;

    // ==========================================================================
    // DOM Elements
    // ==========================================================================
    const $ = (id) => document.getElementById(id);
    
    const elements = {
        // Onboarding
        onboardingScreen: $('onboardingScreen'),
        carousel: $('carousel'),
        carouselTrack: $('carouselTrack'),
        carouselPrev: $('carouselPrev'),
        carouselNext: $('carouselNext'),
        carouselIndicators: $('carouselIndicators'),
        getStartedBtn: $('getStartedBtn'),
        skipBtn: $('skipBtn'),
        
        // App
        appWrapper: $('appWrapper'),
        
        // Upload
        uploadZone: $('uploadZone'),
        imageInput: $('imageInput'),
        cameraInput: $('cameraInput'),
        uploadPlaceholder: $('uploadPlaceholder'),
        previewContainer: $('previewContainer'),
        previewImage: $('previewImage'),
        removeImage: $('removeImage'),
        cameraBtn: $('cameraBtn'),
        analyzeBtn: $('analyzeBtn'),
        
        // Results
        resultsSection: $('resultsSection'),
        loadingState: $('loadingState'),
        resultsContent: $('resultsContent'),
        resultIcon: $('resultIcon'),
        resultLabel: $('resultLabel'),
        severityBadge: $('severityBadge'),
        confidenceValue: $('confidenceValue'),
        ringFill: $('ringFill'),
        resultDescription: $('resultDescription'),
        probabilitiesCard: $('probabilitiesCard'),
        probabilityBars: $('probabilityBars'),
        causesCard: $('causesCard'),
        causesList: $('causesList'),
        recommendationsCard: $('recommendationsCard'),
        recommendationsList: $('recommendationsList'),
        analyzeAnotherBtn: $('analyzeAnotherBtn'),
        
        // Modal
        infoBtn: $('infoBtn'),
        aboutModal: $('aboutModal'),
        closeModal: $('closeModal'),
        
        // Other
        currentYear: $('currentYear')
    };

    // ==========================================================================
    // Initialization
    // ==========================================================================
    function init() {
        // Set current year
        if (elements.currentYear) {
            elements.currentYear.textContent = new Date().getFullYear();
        }

        // Check if user has seen onboarding
        const hasSeenOnboarding = localStorage.getItem('plantguard-onboarding-seen');
        
        if (hasSeenOnboarding) {
            skipOnboarding();
        } else {
            initCarousel();
        }

        // Bind main app events
        bindAppEvents();
        
        console.log('🌿 PlantGuard initialized');
    }

    // ==========================================================================
    // Onboarding & Carousel
    // ==========================================================================
    function initCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        // Arrow navigation
        elements.carouselPrev?.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
            resetAutoSlide();
        });
        
        elements.carouselNext?.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
            resetAutoSlide();
        });
        
        // Indicator clicks
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                resetAutoSlide();
            });
        });
        
        // Get Started button
        elements.getStartedBtn?.addEventListener('click', completeOnboarding);
        elements.skipBtn?.addEventListener('click', completeOnboarding);
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (elements.onboardingScreen?.classList.contains('hidden')) return;
            
            if (e.key === 'ArrowLeft') {
                goToSlide(currentSlide - 1);
                resetAutoSlide();
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentSlide + 1);
                resetAutoSlide();
            } else if (e.key === 'Enter') {
                completeOnboarding();
            }
        });
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        elements.carousel?.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        elements.carousel?.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSlide(currentSlide + 1);
                } else {
                    goToSlide(currentSlide - 1);
                }
                resetAutoSlide();
            }
        }
        
        // Start auto-slide
        startAutoSlide();
    }
    
    function goToSlide(index) {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        const totalSlides = slides.length;
        
        // Wrap around
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        currentSlide = index;
        
        // Move track
        if (elements.carouselTrack) {
            elements.carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        // Update indicators
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === currentSlide);
        });
        
        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentSlide);
        });
    }
    
    function startAutoSlide() {
        autoSlideTimer = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, CONFIG.autoSlideInterval);
    }
    
    function resetAutoSlide() {
        clearInterval(autoSlideTimer);
        startAutoSlide();
    }
    
    function completeOnboarding() {
        clearInterval(autoSlideTimer);
        localStorage.setItem('plantguard-onboarding-seen', 'true');
        
        // Fade out onboarding
        elements.onboardingScreen.style.opacity = '0';
        elements.onboardingScreen.style.transition = 'opacity 0.4s ease-out';
        
        setTimeout(() => {
            elements.onboardingScreen.classList.add('hidden');
            elements.appWrapper.classList.remove('hidden');
            elements.appWrapper.classList.add('entering');
            
            setTimeout(() => {
                elements.appWrapper.classList.remove('entering');
            }, 600);
        }, 400);
    }
    
    function skipOnboarding() {
        elements.onboardingScreen?.classList.add('hidden');
        elements.appWrapper?.classList.remove('hidden');
    }

    // ==========================================================================
    // Main App Events
    // ==========================================================================
    function bindAppEvents() {
        // Upload zone click
        elements.uploadZone?.addEventListener('click', (e) => {
            if (e.target === elements.removeImage || elements.removeImage?.contains(e.target)) {
                return;
            }
            elements.imageInput?.click();
        });

        // File inputs
        elements.imageInput?.addEventListener('change', handleFileSelect);
        elements.cameraInput?.addEventListener('change', handleFileSelect);

        // Camera button
        elements.cameraBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.cameraInput?.click();
        });

        // Drag and drop
        elements.uploadZone?.addEventListener('dragover', handleDragOver);
        elements.uploadZone?.addEventListener('dragleave', handleDragLeave);
        elements.uploadZone?.addEventListener('drop', handleDrop);

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, preventDefaults);
        });

        // Remove image
        elements.removeImage?.addEventListener('click', (e) => {
            e.stopPropagation();
            resetUpload();
        });

        // Analyze
        elements.analyzeBtn?.addEventListener('click', analyzeImage);

        // Analyze another
        elements.analyzeAnotherBtn?.addEventListener('click', resetToUpload);
        
        // Modal
        elements.infoBtn?.addEventListener('click', () => {
            elements.aboutModal?.classList.remove('hidden');
        });
        
        elements.closeModal?.addEventListener('click', () => {
            elements.aboutModal?.classList.add('hidden');
        });
        
        elements.aboutModal?.addEventListener('click', (e) => {
            if (e.target === elements.aboutModal) {
                elements.aboutModal.classList.add('hidden');
            }
        });
        
        // ESC to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !elements.aboutModal?.classList.contains('hidden')) {
                elements.aboutModal.classList.add('hidden');
            }
        });
    }

    // ==========================================================================
    // Drag & Drop
    // ==========================================================================
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDragOver(e) {
        preventDefaults(e);
        elements.uploadZone?.classList.add('dragover');
    }

    function handleDragLeave(e) {
        preventDefaults(e);
        elements.uploadZone?.classList.remove('dragover');
    }

    function handleDrop(e) {
        preventDefaults(e);
        elements.uploadZone?.classList.remove('dragover');
        
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    }

    // ==========================================================================
    // File Handling
    // ==========================================================================
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    }

    function processFile(file) {
        if (!CONFIG.allowedTypes.includes(file.type)) {
            showNotification('Please upload a valid image file', 'error');
            return;
        }

        if (file.size > CONFIG.maxFileSize) {
            showNotification('File size must be less than 10MB', 'error');
            return;
        }

        currentFile = file;

        const reader = new FileReader();
        reader.onload = (e) => showPreview(e.target.result);
        reader.onerror = () => showNotification('Failed to read file', 'error');
        reader.readAsDataURL(file);
    }

    function showPreview(dataUrl) {
        elements.previewImage.src = dataUrl;
        elements.uploadPlaceholder?.classList.add('hidden');
        elements.previewContainer?.classList.remove('hidden');
        elements.analyzeBtn?.classList.remove('hidden');
        hideResults();
    }

    function resetUpload() {
        currentFile = null;
        if (elements.imageInput) elements.imageInput.value = '';
        if (elements.cameraInput) elements.cameraInput.value = '';
        
        elements.previewImage.src = '';
        elements.previewContainer?.classList.add('hidden');
        elements.uploadPlaceholder?.classList.remove('hidden');
        elements.analyzeBtn?.classList.add('hidden');
    }

    function resetToUpload() {
        resetUpload();
        hideResults();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ==========================================================================
    // Analysis
    // ==========================================================================
    async function analyzeImage() {
        if (!currentFile) {
            showNotification('Please upload an image first', 'error');
            return;
        }

        showLoading();

        try {
            const formData = new FormData();
            formData.append('image', currentFile);

            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Analysis result:', data);
            displayResults(data);

        } catch (error) {
            console.error('Analysis error:', error);
            displayError(error.message);
        }
    }

    // ==========================================================================
    // Results Display
    // ==========================================================================
    function showLoading() {
        elements.resultsSection?.classList.remove('hidden');
        elements.loadingState?.classList.remove('hidden');
        elements.resultsContent?.classList.add('hidden');
        
        setTimeout(() => {
            elements.resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    function hideLoading() {
        elements.loadingState?.classList.add('hidden');
    }

    function hideResults() {
        elements.resultsSection?.classList.add('hidden');
        elements.loadingState?.classList.add('hidden');
        elements.resultsContent?.classList.add('hidden');
    }

    function displayResults(data) {
        hideLoading();
        
        const prediction = data.prediction || 'Unknown';
        const confidence = data.confidence || 0;
        const severity = data.severity || 'unknown';
        const description = data.description || getDefaultDescription(prediction);
        const causes = data.causes || [];
        const recommendations = data.recommendations || getDefaultRecommendations(prediction);
        const allProbabilities = data.all_probabilities || {};

        // Icon
        elements.resultIcon.textContent = data.icon || DISEASE_ICONS[prediction] || '🌱';

        // Label
        elements.resultLabel.textContent = formatPredictionLabel(prediction);

        // Severity
        const severityInfo = SEVERITY_MAP[severity] || SEVERITY_MAP.unknown;
        elements.severityBadge.className = `severity-pill ${severityInfo.class}`;
        elements.severityBadge.querySelector('.severity-text').textContent = severityInfo.text;

        // Confidence ring
        const confidencePercent = Math.round(confidence * 100);
        elements.confidenceValue.textContent = `${confidencePercent}%`;
        
        // Animate ring (circumference = 2 * PI * 45 = ~283)
        const circumference = 283;
        const offset = circumference - (circumference * confidence);
        setTimeout(() => {
            elements.ringFill.style.strokeDashoffset = offset;
        }, 100);

        // Description
        elements.resultDescription.innerHTML = `<p>${description}</p>`;

        // Probabilities
        renderProbabilityBars(allProbabilities);

        // Causes
        if (causes.length > 0) {
            renderList(elements.causesList, causes);
            elements.causesCard?.classList.remove('hidden');
        } else {
            elements.causesCard?.classList.add('hidden');
        }

        // Recommendations
        if (recommendations.length > 0) {
            renderList(elements.recommendationsList, recommendations);
            elements.recommendationsCard?.classList.remove('hidden');
        }

        // Show results
        elements.resultsContent?.classList.remove('hidden');
        
        setTimeout(() => {
            elements.resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    function displayError(message) {
        hideLoading();

        elements.resultIcon.textContent = '⚠️';
        elements.resultLabel.textContent = 'Analysis Failed';
        
        elements.severityBadge.className = 'severity-pill';
        elements.severityBadge.querySelector('.severity-text').textContent = 'Error';

        elements.confidenceValue.textContent = '0%';
        elements.ringFill.style.strokeDashoffset = 283;

        elements.resultDescription.innerHTML = `<p>We couldn't analyze your image. ${message}. Please try again.</p>`;

        elements.probabilitiesCard?.classList.add('hidden');
        elements.causesCard?.classList.add('hidden');
        elements.recommendationsCard?.classList.add('hidden');

        elements.resultsContent?.classList.remove('hidden');
    }

    function renderProbabilityBars(probabilities) {
        const container = elements.probabilityBars;
        if (!container) return;

        container.innerHTML = '';

        const icons = { 'Healthy': '🌿', 'Powdery': '🍂', 'Rust': '🍁' };
        const classes = { 'Healthy': 'healthy', 'Powdery': 'powdery', 'Rust': 'rust' };

        const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

        sorted.forEach(([name, prob], index) => {
            const percent = Math.round(prob * 100);
            const item = document.createElement('div');
            item.className = 'probability-item';
            
            item.innerHTML = `
                <div class="probability-header">
                    <span class="probability-name">
                        <span>${icons[name] || '🌱'}</span>
                        ${name}
                    </span>
                    <span class="probability-percent">${percent}%</span>
                </div>
                <div class="probability-bar">
                    <div class="probability-fill ${classes[name] || ''}" style="width: 0%"></div>
                </div>
            `;

            container.appendChild(item);

            setTimeout(() => {
                const fill = item.querySelector('.probability-fill');
                if (fill) fill.style.width = `${percent}%`;
            }, 200 + index * 100);
        });
    }

    function renderList(container, items) {
        if (!container) return;
        container.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    }

    // ==========================================================================
    // Utilities
    // ==========================================================================
    function formatPredictionLabel(prediction) {
        const labels = {
            'Healthy': 'Healthy Plant',
            'Powdery': 'Powdery Mildew',
            'Rust': 'Rust Disease',
            'Uncertain': 'Uncertain Result'
        };
        return labels[prediction] || prediction;
    }

    function getDefaultDescription(prediction) {
        const descriptions = {
            'Healthy': 'Your plant appears to be in good health with no visible signs of disease.',
            'Powdery': 'Your plant shows signs of Powdery Mildew, a common fungal disease.',
            'Rust': 'Your plant appears to be affected by Rust, a fungal disease.',
            'Uncertain': 'The analysis was inconclusive. Please try with a clearer image.'
        };
        return descriptions[prediction] || 'Analysis complete.';
    }

    function getDefaultRecommendations(prediction) {
        const recs = {
            'Healthy': ['Continue regular care', 'Ensure adequate sunlight', 'Monitor for changes'],
            'Powdery': ['Improve air circulation', 'Reduce humidity', 'Apply fungicide'],
            'Rust': ['Remove infected leaves', 'Apply fungicide', 'Avoid wetting leaves']
        };
        return recs[prediction] || [];
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'error' ? '#fef2f2' : '#f0fdf4'};
            border: 1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'};
            border-radius: 12px;
            color: ${type === 'error' ? '#dc2626' : '#16a34a'};
            font-weight: 600;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
            z-index: 3000;
            animation: fadeSlideUp 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ==========================================================================
    // Start
    // ==========================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

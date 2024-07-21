let model, maxPredictions;

// Load the Teachable Machine model
async function loadModel() {
    const modelURL = 'model/model.json';
    const metadataURL = 'model/metadata.json';

    console.log("Loading model...");
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("Model loaded");
}

// Handle image upload
document.getElementById('imageUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const img = document.getElementById('uploadedImage');
        img.src = e.target.result;
        img.onload = () => {
            console.log("Image uploaded and loaded");
        };
        img.style.display = 'block';
    };

    reader.readAsDataURL(file);
});

// Preprocess the image to match the input shape expected by the model
function preprocessImage(img) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const imgElement = new Image();
        
        imgElement.onload = () => {
            canvas.width = 224;
            canvas.height = 224;
            ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
            const tensor = tf.browser.fromPixels(canvas)
                .resizeNearestNeighbor([224, 224])
                .toFloat()
                .expandDims();
            resolve(tensor);
        };
        
        imgElement.onerror = () => {
            reject(new Error('Failed to load image.'));
        };

        imgElement.src = img.src; // Ensure image source is set
    });
}

// Classify the uploaded image
document.getElementById('classifyButton').addEventListener('click', async () => {
    const img = document.getElementById('uploadedImage');
    if (!img.src) {
        console.log("No image uploaded");
        alert("Please upload an image first.");
        return;
    }

    console.log("Classifying image...");
    try {
        const processedImage = await preprocessImage(img);
        const prediction = await model.predict(processedImage);

        let resultText = '';
        for (let i = 0; i < maxPredictions; i++) {
            resultText += `${prediction[i].className}: ${prediction[i].probability.toFixed(2)}<br>`;
        }

        document.getElementById('result').innerHTML = resultText;
        console.log("Classification complete");
    } catch (error) {
        console.error("Error classifying image:", error);
    }
});

// Load the model when the page loads
window.onload = () => {
    loadModel();
};

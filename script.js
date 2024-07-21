const URL = 'https://yourusername.github.io/your-repository/model/';

let model, webcam, classifier;

async function loadModel() {
    console.log('Loading model...');
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';
    model = await tmImage.load(modelURL, metadataURL);
    console.log('Model loaded');
}

window.onload = () => {
    loadModel();
    
    const uploadButton = document.getElementById('classifyButton');
    uploadButton.addEventListener('click', async () => {
        const imageElement = document.getElementById('uploadedImage');
        if (!imageElement.src) {
            console.log('No image uploaded');
            return;
        }

        console.log('Classifying image...');
        try {
            const tensor = await preprocessImage(imageElement);
            const prediction = await model.predict(tensor);
            console.log(prediction);
            document.getElementById('result').innerText = JSON.stringify(prediction);
        } catch (error) {
            console.error('Error during prediction:', error);
        }
    });
};

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

        imgElement.src = img.src;
    });
}

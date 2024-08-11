// https://github.com/nimiq/qr-scanner
import QrScanner from '/js/qr-scanner.min.js';

const video = document.getElementById('qr-video');
const videoContainer = document.getElementById('video-container');
const camHasCamera = document.getElementById('cam-has-camera');
const camList = document.getElementById('cam-list');
const camHasFlash = document.getElementById('cam-has-flash');
const flashToggle = document.getElementById('flash-toggle');
const flashState = document.getElementById('flash-state');
const camQrResult = document.getElementById('cam-qr-result');
const camQrResultTimestamp = document.getElementById('cam-qr-result-timestamp');
const fileSelector = document.getElementById('file-selector');
const fileQrResult = document.getElementById('file-qr-result');
var status = true;

function batal() {
    $("#qr-video").show();
}

function setResult(label, result) {
    $("#qr-video").hide();
    label.textContent = result.data;
    camQrResultTimestamp.textContent = new Date().toString();
    label.style.color = 'teal';
    clearTimeout(label.highlightTimeout);
    label.highlightTimeout = setTimeout(() => label.style.color = 'inherit', 100);

    var urlCek = "https://pqnbikalbar.glyphiveborneo.com/cekkodeunik?kodeunik=" + result.data;

    if (status) {

        $.getJSON(urlCek, function(data) {
            $("#qrcode").val(data.data.nama);
        });
        status = false
    } {

    }
}

// ####### Web Cam Scanning #######

const scanner = new QrScanner(video, result => setResult(camQrResult, result), {
    onDecodeError: error => {
        camQrResult.textContent = error;
        camQrResult.style.color = 'both';
    },
    highlightScanRegion: true,
    highlightCodeOutline: true,
});

const updateFlashAvailability = () => {
    scanner.hasFlash().then(hasFlash => {
        camHasFlash.textContent = hasFlash;
        flashToggle.style.display = hasFlash ? 'inline-block' : 'none';
    });
};

scanner.start().then(() => {
    updateFlashAvailability();
    // List cameras after the scanner started to avoid listCamera's stream and the scanner's stream being requested
    // at the same time which can result in listCamera's unconstrained stream also being offered to the scanner.
    // Note that we can also start the scanner after listCameras, we just have it this way around in the demo to
    // start the scanner earlier.
    QrScanner.listCameras(true).then(cameras => cameras.forEach(camera => {
        const option = document.createElement('option');
        option.value = camera.id;
        option.text = camera.label;
        camList.appendChild(option);
    }));
});

QrScanner.hasCamera().then(hasCamera => camHasCamera.textContent = hasCamera);

// for debugging
window.scanner = scanner;

document.getElementById('scan-region-highlight-style-select').addEventListener('change', (e) => {
    videoContainer.className = e.target.value;
    scanner._updateOverlay(); // reposition the highlight because style 2 sets position: relative
});

document.getElementById('show-scan-region').addEventListener('change', (e) => {
    const input = e.target;
    const label = input.parentNode;
    label.parentNode.insertBefore(scanner.$canvas, label.nextSibling);
    scanner.$canvas.style.display = input.checked ? 'block' : 'none';
});

$("#cam-list").change(function() {
    scanner.setCamera($("#cam-list").val()).then(updateFlashAvailability)
});

flashToggle.addEventListener('click', () => {
    scanner.toggleFlash().then(() => flashState.textContent = scanner.isFlashOn() ? 'on' : 'off');
});

document.getElementById('start-button').addEventListener('click', () => {
    scanner.start();
});

document.getElementById('stop-button').addEventListener('click', () => {
    scanner.stop();
});
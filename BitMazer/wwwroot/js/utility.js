import { DomElements } from './constants/domElements.js';
import { DwnldFilesNamesConstants } from './constants/download-files-names.js';

const {
    DEC_INPUT_FIELD,
    DOWNLOAD_CONTAINER
} = DomElements;

export const utility = {
    arrayBufferToBase64: async function (buffer) {
        const blob = new Blob([buffer]);
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        return base64;
    },
    extractMetadataFromFile: async function () {
        const file = document.getElementById(DEC_INPUT_FIELD).files[0];

        if (!file) {
            throw new Error("No file selected.");
        }

        const fileText = await file.text();

        let json;
        try {
            json = JSON.parse(fileText);
        } catch (err) {
            throw new Error("Invalid JSON format. ", err);
        }

        if (!json.aad) {
            throw new Error("No metadata found in the JSON file.");
        }

        return JSON.stringify(json.aad);
    },
    createDownloadButton: function (fileData, blobType, fileName) {
        let buttonId;
        if (fileName.includes(DwnldFilesNamesConstants.ENC_KEY_FILE)) {
            buttonId = "download-btn-enc-key";
        } else if (fileName.includes(DwnldFilesNamesConstants.DEC_KEY_FILE)) {
            buttonId = "download-btn-dec-key";
        }
        else {
            buttonId = "download-btn-file";
        }
        const blob = new Blob([fileData], { type: blobType });
        const url = URL.createObjectURL(blob);


        // Attach a button link
        const buttonLink = document.createElement("a");
        buttonLink.id = buttonId;
        buttonLink.classList.add("btn", "btn-outline-primary", "me-2", "text-decoration-none");
        buttonLink.innerHTML = `<span class="bi bi-download"></span> <span>${fileName}</span>`;
        buttonLink.href = url;
        buttonLink.download = fileName;

        // Append the button to the download section
        const resultLabel = document.getElementById('result-label')
        if (resultLabel) {
            resultLabel.className = "d-none";
        }

        const downloadContainer = document.getElementById(DOWNLOAD_CONTAINER);
        downloadContainer.appendChild(buttonLink);
    },
    clearDownloadSection: function () {
        const downloadContainer = document.getElementById(DOWNLOAD_CONTAINER);

        const buttonLinks = downloadContainer.querySelectorAll('a');
        buttonLinks.forEach(buttonLinks => buttonLinks.remove());
        const resultLabel = document.getElementById('result-label')
        if (resultLabel) {
            resultLabel.classList.remove("d-none");
        }
    },
    showLoader: function () {
        document.getElementById('loader').classList.remove('d-none');
    },

    hideLoader: function () {
        setTimeout(() => {
            document.getElementById('loader').classList.add('d-none');
        }, 5000); // 5000 milliseconds = 5 seconds
        console.log("HIDE LOADER called");

    },

    estimateMemoryFromBuffers: function (...buffers) {
        let totalBytes = 0;

        for (const buf of buffers) {
            if (!buf) continue;

            if (typeof buf === 'string') {
                totalBytes += new TextEncoder().encode(buf).byteLength;
            } else if (buf instanceof Uint8Array || buf instanceof ArrayBuffer) {
                totalBytes += buf.byteLength || 0;
            }
        }

        return totalBytes;
    },

    wordArrayToArrayBuffer: function (wordArray) {
        const words = wordArray.words;
        const sigBytes = wordArray.sigBytes;

        const buffer = new ArrayBuffer(sigBytes);
        const view = new Uint8Array(buffer);

        for (let i = 0; i < sigBytes; i++) {
            view[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xFF;
        }

        return buffer;
    },

    wordArrayToUint8Array: function (wordArray) {
        const words = wordArray.words;
        const sigBytes = wordArray.sigBytes;

        const u8 = new Uint8Array(sigBytes);
        for (let i = 0; i < sigBytes; i++) {
            u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        return u8;
    },

    generateEncodedAAD: async function (metadata, iv) {
        const aadObject = {
            ...metadata,
            iv: await this.arrayBufferToBase64(iv)
        };

        const encoder = new TextEncoder();
        return encoder.encode(JSON.stringify(aadObject));
    }
}
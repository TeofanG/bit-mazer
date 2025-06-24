import { DomElements } from './constants/domElements.js';
import { DwnldFilesNamesConstants } from './constants/download-files-names.js';

const {
    DEC_INPUT_FIELD,
    DOWNLOAD_CONTAINER
} = DomElements;

export const utility = {
    arrayBufferToBase64: function (buffer) {
        return btoa(
            Array.from(new Uint8Array(buffer))
                .map(b => String.fromCharCode(b))
                .join('')
        );
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

        if (!json.metadata) {
            throw new Error("No metadata found in the JSON file.");
        }

        return JSON.stringify(json.metadata);
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
    },
    showLoader: function () {
        document.getElementById('loader').classList.remove('d-none');
    },

    hideLoader: function () {
        setTimeout(() => {
            document.getElementById('loader').classList.add('d-none');
        }, 5000); // 5000 milliseconds = 5 seconds
        console.log("HIDE LOADER called");

    }
}
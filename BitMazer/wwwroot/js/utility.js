import { DomElements } from './constants/domElements.js';
import { DwnldFilesNamesConstants } from './constants/download-files-names.js';

const {
    DEC_INPUT_FIELD,
    DOWNLOAD_CONTAINER
} = DomElements;

window.utility = {
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

        // Create a Bootstrap-styled button
        const downloadContainer = document.getElementById(DOWNLOAD_CONTAINER);

        const button = document.createElement("button");
        button.id = buttonId;

        const buttonLink = document.createElement("a");
        buttonLink.className = "btn btn-info w-auto";
        buttonLink.innerHTML = `<i class="bi bi-download"></i> Download <i>${fileName}</i>`;
        buttonLink.href = url;
        buttonLink.download = fileName;

        // Append the button to a Bootstrap container (if available)
        let container = document.querySelector(".card");
        if (!container) {
            container = document.createElement("div");
            container.className = "card p-4";
            document.body.appendChild(container);
        }

        button.appendChild(buttonLink);
        downloadContainer.appendChild(button);
        container.appendChild(downloadContainer);
    }
}
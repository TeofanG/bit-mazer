import { DomElements } from './constants/domElements.js';

const {
    DEC_INPUT_FIELD
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
    }
}
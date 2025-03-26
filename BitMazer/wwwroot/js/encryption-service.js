import { CryptoConstants } from './constants/crypto-constants.js';
import { BlobConstants } from './constants/blob-types.js';
import { DwnldFilesNamesConstants } from './constants/download-files-names.js';

window.startEncryption = async function (selectedEncAlg, isCustomKeyEnabled, isKeyReusingEnabled) {
    try {
        // get uploaded file and convert it to ArrayBuffer
        const file = document.getElementById("enc-file-upload").files[0];
        const fileBuffer = await file.arrayBuffer();
        //const originalLength = fileBuffer.byteLength;

        //obtain the iv, key and encrypted data depending on encryption algorithm
        let iv;
        let encKey;
        let ciphertext;

        switch (selectedEncAlg) {
            case "AES_GCM":
                encKey = await aes.getKey("AES-GCM", CryptoConstants.AES_KEY_SIZE);
                if (!encKey) throw new Error("Failed to generate AES key.");

                iv = window.crypto.getRandomValues(new Uint8Array(CryptoConstants.AES_IV_SIZE));
                ciphertext = await aes.encrypt(fileBuffer, iv, encKey);
                encKey = await crypto.subtle.exportKey("raw", encKey);
                break;
            case "ChaCha20":
                iv = nacl.randomBytes(CryptoConstants.CHACHA_IV_SIZE);
                encKey = chacha.generateKey();
                ciphertext = chacha.encrypt(new Uint8Array(fileBuffer), iv, encKey);
                break;
            case "Twofish":
                iv = twofish.generateIV(CryptoConstants.TWOFISH_IV_SIZE);
                encKey = twofish.generateKey(CryptoConstants.TWOFISH_KEY_SIZE);

                ciphertext = twofish.encrypt(new Uint8Array(fileBuffer), iv, encKey);
                break;
            default:
                console.error("Unknown algorithm provided for encryption (" + selectedEncAlg + ").");
                break;
        }  

        // encrypt the encryption key using RSA
        const rsaKey = await rsa.getKey(isCustomKeyEnabled);

        if (!rsaKey) {
            console.error("Error in obtaining the RSA key.");
        }

        //if a key pair is provided by the user use it, else generate another one?????
        let publicRSAKey = isCustomKeyEnabled ? rsaKey : rsaKey.publicKey;

        let encryptedKey = await rsa.encrypt(publicRSAKey, encKey); 
        if (!encryptedKey)
            console.error("RSA encryption of the encryption key failed. Make sure that you provided a valid public RSA key.");

        // create the JSON model for the output file
        const encryptedJSON = {
            metadata: {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                encryptionAlgorithm: selectedEncAlg,
            },
            iv: arrayBufferToBase64(iv),
            key: arrayBufferToBase64(encryptedKey),
            ciphertext: arrayBufferToBase64(ciphertext)
        };

        // create button for encrypted file and key/s download
        createDownloadButton(JSON.stringify(encryptedJSON, null, 2), BlobConstants.APP_JSON, file.name + DwnldFilesNamesConstants.ENCRYPTED_FILE);

        const exportedKeys = await rsa.exportKeysToFiles(rsaKey);;
        if (isCustomKeyEnabled == false) {
            const exportedRSAprivatekey = exportedKeys.privateKeyUint8Array;
            createDownloadButton(exportedRSAprivatekey, BlobConstants.APP_OCTET, DwnldFilesNamesConstants.DEC_KEY_FILE);
        }
        if (isKeyReusingEnabled == true) {
            const exportedRSApublickey = exportedKeys.publicKeyUint8Array;
            createDownloadButton(exportedRSApublickey, BlobConstants.APP_OCTET, DwnldFilesNamesConstants.ENC_KEY_FILE);
        }
        return "Success"; 
    } catch (err) {
        return `Error: ${err}`;
    }
}

window.createDownloadButton = async function (fileData, blobType, fileName) {
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
    const downloadContainer = document.getElementById("download-container");

    const button = document.createElement("button");
    button.id = buttonId;

    const buttonLink = document.createElement("a");
    buttonLink.className = "btn btn-primary w-auto";
    buttonLink.innerHTML = `<i class="bi bi-download"></i> Download ${fileName}`;
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
};


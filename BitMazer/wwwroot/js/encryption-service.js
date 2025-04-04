import { CryptoConstants } from './constants/crypto-constants.js';
import { DomElements } from './constants/domElements.js';
import { BlobConstants } from './constants/blob-types.js';

const {
    ENC_INPUT_FIELD,
    DOWNLOAD_CONTAINER
} = DomElements;

const {
    AES_NAME,
    AES_KEY_SIZE,
    AES_IV_SIZE,
    CHACHA_IV_SIZE,
    CHACHA_KEY_SIZE,
    TWOFISH_IV_SIZE,
    TWOFISH_KEY_SIZE
} = CryptoConstants;


window.startEncryption = async function (selectedEncAlg, isCustomKeyEnabled, isKeyReusingEnabled) {
    try {
        // get uploaded file and convert it to ArrayBuffer
        const file = document.getElementById(ENC_INPUT_FIELD).files[0];
        const fileBuffer = await file.arrayBuffer();
        //const originalLength = fileBuffer.byteLength;

        //obtain the iv, key and encrypted data depending on encryption algorithm
        let iv;
        let encKey;
        let ciphertext;

        switch (selectedEncAlg) {
            case "AES_GCM":
                encKey = await aes.getKey(AES_NAME, AES_KEY_SIZE);
                if (!encKey) throw new Error("Failed to generate AES key.");

                iv = window.crypto.getRandomValues(new Uint8Array(AES_IV_SIZE));
                ciphertext = await aes.encrypt(fileBuffer, iv, encKey);
                encKey = await crypto.subtle.exportKey("raw", encKey);
                break;
            case "ChaCha20":
                iv = nacl.randomBytes(CHACHA_IV_SIZE);
                encKey = chacha.generateKey();
                ciphertext = chacha.encrypt(new Uint8Array(fileBuffer), iv, encKey);
                break;
            case "Twofish":
                iv = twofish.generateIV(TWOFISH_IV_SIZE);
                encKey = twofish.generateKey(TWOFISH_KEY_SIZE);

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
            iv: utility.arrayBufferToBase64(iv),
            key: utility.arrayBufferToBase64(encryptedKey),
            ciphertext: utility.arrayBufferToBase64(ciphertext)
        };

        // create button for encrypted file and key/s download
        utility.createDownloadButton(JSON.stringify(encryptedJSON, null, 2), BlobConstants.APP_JSON, file.name + DwnldFilesNamesConstants.ENCRYPTED_FILE);

        const exportedKeys = await rsa.exportKeysToFiles(rsaKey);;
        if (isCustomKeyEnabled == false) {
            const exportedRSAprivatekey = exportedKeys.privateKeyUint8Array;
            utility.createDownloadButton(exportedRSAprivatekey, BlobConstants.APP_OCTET, DwnldFilesNamesConstants.DEC_KEY_FILE);
        }
        if (isKeyReusingEnabled == true) {
            const exportedRSApublickey = exportedKeys.publicKeyUint8Array;
            utility.createDownloadButton(exportedRSApublickey, BlobConstants.APP_OCTET, DwnldFilesNamesConstants.ENC_KEY_FILE);
        }
        return "Success";
    } catch (err) {
        return `Error: ${err}`;
    }
}

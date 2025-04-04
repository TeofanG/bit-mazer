import { BlobConstants } from './constants/blob-types.js';
import { DomElements } from './constants/domElements.js';

const {
    DEC_INPUT_FIELD,
    DEC_KEY_INPUT_FIELD
} = DomElements;

window.startDecryption = async function () {
    try {
        // convert the uploaded file to json object and extract fields
        const file = document.getElementById(DEC_INPUT_FIELD).files[0];
        const fileText = await file.text();
        const fileJson = JSON.parse(fileText);
        const { metadata, iv, key, ciphertext } = fileJson;

        const encryptionAlg = metadata.encryptionAlgorithm;
        const decIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
        const encryptedKey = Uint8Array.from(atob(key), c => c.charCodeAt(0));
        const encryptedData = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

        // get the uploaded key and import it
        const rsaPrivateKeyFile = document.getElementById(DEC_KEY_INPUT_FIELD).files[0];
        console.log(DEC_KEY_INPUT_FIELD);
        const rsaPrivateKey = await rsa.importPrivateKey(rsaPrivateKeyFile);

        //decrypt the encryption key of the file with the previous obtained rsa key
        const decryptedKeyRaw = await rsa.decrypt(rsaPrivateKey, encryptedKey);
        if (!decryptedKeyRaw) {
            console.error("Failed to decrypt AES/ChaCha key.");
            return;
        }

        //decrypt file's data depending on the algorithm
        let decryptedData;
        switch (encryptionAlg) {
            case "AES_GCM":
                const aesKey = await aes.importKey(decryptedKeyRaw);
                decryptedData = await aes.decrypt(aesKey, decIV, encryptedData.buffer);
                break;
            case "ChaCha20":
                decryptedData = chacha.decrypt(
                    encryptedData,
                    decIV,
                    new Uint8Array(decryptedKeyRaw)
                );
                break;
            case "Twofish":
                decryptedData = twofish.decrypt(
                    encryptedData, decIV, new Uint8Array(decryptedKeyRaw)

                );
                break;
            default:
                throw new Error("Unknown algorithm provided for decryption (" + encryptionAlg + ").");
                break;
        }

        //add UI button for user-downloading
        utility.createDownloadButton(decryptedData, BlobConstants.APP_OCTET, metadata.fileName);

        return "Success";
    } catch (err) {
        return `Error: ${err.message}`;

    }
}
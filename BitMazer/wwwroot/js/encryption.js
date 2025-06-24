import { CryptoConstants } from './constants/crypto-constants.js';
import { DomElements } from './constants/domElements.js';
import { BlobConstants } from './constants/blob-types.js';
import { DwnldFilesNamesConstants } from './constants/download-files-names.js';
import { utility } from './utility.js';

const {
    ENC_INPUT_FIELD,
    ENC_KEY_INPUT_FIELD
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

window.startEncryption = async function (selectedEncAlg, selectedKeySize, isCustomKeyEnabled, isKeyReusingEnabled) {
    try {
        const file = document.getElementById(ENC_INPUT_FIELD).files[0];

        utility.showLoader();
        await new Promise(resolve => setTimeout(resolve, 0));

        const fileBuffer = await file.arrayBuffer();

        var keyBuffer;
        if (isCustomKeyEnabled) {
            const key = document.getElementById(ENC_KEY_INPUT_FIELD).files[0];
            keyBuffer = await key.arrayBuffer();
        } else {
            keyBuffer = null;
        }

        const worker = new Worker('/js/workers/encryption-worker.js', { type: 'module' });

        return new Promise((resolve) => {
            worker.postMessage({
                fileBuffer,
                keyBuffer,
                selectedEncAlg,
                selectedKeySize,
                isCustomKeyEnabled,
                isKeyReusingEnabled,
                constants: {
                    AES_NAME,
                    AES_KEY_SIZE,
                    AES_IV_SIZE,
                    CHACHA_IV_SIZE,
                    CHACHA_KEY_SIZE,
                    TWOFISH_IV_SIZE,
                    TWOFISH_KEY_SIZE
                }
            }, [fileBuffer]);

            worker.onerror = (e) => {
                console.error("Worker error:", e);
            };

            const startTime = performance.now();

            worker.onmessage = async (e) => {
                const { success, result, error } = e.data;

                const elapsed = performance.now() - startTime;

                const MIN_DURATION = 1500;
                const remainingTime = MIN_DURATION - elapsed;

                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }

                document.getElementById('loader').classList.add('d-none');

                if (!success) {
                    resolve(`Error: ${error}`);
                    return;
                }

                // UI: update loader/DOM after worker finishes
                utility.clearDownloadSection();

                const encryptedJSON = {
                    metadata: {
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                        encryptionAlgorithm: selectedEncAlg,
                    },
                    iv: result.iv,
                    key: result.encryptedKey,
                    ciphertext: result.ciphertext
                };

                utility.createDownloadButton(JSON.stringify(encryptedJSON, null, 2), BlobConstants.APP_JSON, file.name + DwnldFilesNamesConstants.ENCRYPTED_FILE);

                if (!isCustomKeyEnabled && result.rsaKey?.privateKeyUint8Array) {
                    utility.createDownloadButton(result.rsaKey.privateKeyUint8Array, BlobConstants.APP_OCTET, DwnldFilesNamesConstants.DEC_KEY_FILE);
                }

                if (isKeyReusingEnabled && result.rsaKey?.publicKeyUint8Array) {
                    utility.createDownloadButton(result.rsaKey.publicKeyUint8Array, BlobConstants.APP_OCTET, DwnldFilesNamesConstants.ENC_KEY_FILE);
                }

                resolve("Success");
            };
        });

    } catch (err) {
        document.getElementById('loader').classList.add('d-none');
        return `Error: ${err}`;
    }
};

import { CryptoConstants } from '/js/constants/crypto-constants.js';
import { DomElements } from '/js/constants/domElements.js';
import { BlobConstants } from '/js/constants/blob-types.js';
import { DwnldFilesNamesConstants } from '/js/constants/download-files-names.js';
import { utility } from '/js/utility.js';
import { rabbit } from '/js/algorithms/rabbit.js';

const {
    ENC_INPUT_FIELD,
    ENC_KEY_INPUT_FIELD
} = DomElements;

const {
    AES_NAME,
    AES_IV_SIZE,
    CHACHA_IV_SIZE,
    TWOFISH_IV_SIZE,
} = CryptoConstants;

async function initEncryption(selectedEncAlg, selectedKeySize, rsaKeySize, isCustomKeyEnabled, isKeyReusingEnabled) {
    try {
        utility.clearDownloadSection();

        const file = document.getElementById(ENC_INPUT_FIELD).files[0];

        utility.showLoader();

        const fileBuffer = await file.arrayBuffer();

        var keyBuffer;
        if (isCustomKeyEnabled) {
            const key = document.getElementById(ENC_KEY_INPUT_FIELD).files[0];
            keyBuffer = await key.arrayBuffer();
        } else {
            keyBuffer = null;
        }

        let rabbitCipherdata = null;
        let rabbitKey = null;
        let rabbitIV = null;
        if (selectedEncAlg === "Rabbit") {
            rabbitIV = new Uint8Array(16);
            crypto.getRandomValues(rabbitIV);

            rabbitKey = new Uint8Array(16);
            crypto.getRandomValues(rabbitKey);

            rabbitCipherdata = rabbit.encrypt(fileBuffer, rabbitIV, rabbitKey);
        }

        const metadata = {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            algorithm: selectedEncAlg,
        }

        const worker = new Worker('/js/workers/encryption-worker.js', { type: 'module' });

        return new Promise((resolve) => {
            worker.postMessage({
                rabbitObj: {
                    cipherdata: rabbitCipherdata,
                    iv: rabbitIV,
                    key: rabbitKey,
                },
                fileBuffer,
                keyBuffer,
                metadata,
                selectedKeySize,
                rsaKeySize,
                isCustomKeyEnabled,
                isKeyReusingEnabled,
                constants: {
                    AES_NAME,
                    AES_IV_SIZE,
                    CHACHA_IV_SIZE,
                    TWOFISH_IV_SIZE,
                }
            }, [fileBuffer]);

            worker.onerror = (e) => {
                console.error("Worker error:", e);
                worker.terminate();
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

                const encryptionOutput = {
                    aad: {
                        ...metadata,
                        iv: result.iv,
                    },
                    ...(result.hmacKey && { hmacKey: result.hmacKey }),
                    ...(result.tag && { tag: result.tag }),
                    key: result.encryptedKey,
                    cipherdata: result.cipherdata
                };

                utility.createDownloadButton(JSON.stringify(encryptionOutput, null, 2), BlobConstants.APP_JSON, file.name + DwnldFilesNamesConstants.ENCRYPTED_FILE);

                if (!isCustomKeyEnabled && result.rsaKey?.privateKeyUint8Array) {
                    utility.createDownloadButton(result.rsaKey.privateKeyUint8Array, BlobConstants.APP_OCTET, DwnldFilesNamesConstants.DEC_KEY_FILE+rsaKeySize+".key");
                }

                if (isKeyReusingEnabled && result.rsaKey?.publicKeyUint8Array) {
                    utility.createDownloadButton(result.rsaKey.publicKeyUint8Array, BlobConstants.APP_OCTET, DwnldFilesNamesConstants.ENC_KEY_FILE+rsaKeySize+".key");
                }

                resolve("Success");
                worker.terminate();
            };
        });

    } catch (err) {
        document.getElementById('loader').classList.add('d-none');
        return `Error: ${err}`;
    }
};

export { initEncryption };

import { CryptoConstants } from '/js/constants/crypto-constants.js';
import { DomSelectors, FileDownloadNames, FileTypes } from '/js/constants/app-constants.js';
import { utility } from '/js/utility.js';
import { hmac } from '/js/hmacUtilities.js';
import { rabbit } from '/js/algorithms/rabbit.js';

const {
    ENC_INPUT_FIELD,
    ENC_KEY_INPUT_FIELD
} = DomSelectors;

const {
    AES_IV_SIZE,
    CHACHA_IV_SIZE,
    TWOFISH_IV_SIZE,
} = CryptoConstants;

async function initEncryption(selectedEncAlg, selectedKeySize, rsaKeySize, isCustomKeyEnabled, isKeyReusingEnabled) {

    const startTime = performance.now();
    const loaderAnimation = document.getElementById('loader');
    loaderAnimation.classList.remove("d-none");

    try {
        utility.clearDownloadSection();
        document.getElementById('loader').classList.remove('d-none');


        const file = document.getElementById(ENC_INPUT_FIELD).files[0];

        const fileBuffer = await file.arrayBuffer();

        var keyBuffer;
        if (isCustomKeyEnabled) {
            const key = document.getElementById(ENC_KEY_INPUT_FIELD).files[0];
            keyBuffer = await key.arrayBuffer();
        } else {
            keyBuffer = null;
        }

        const metadata = {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            algorithm: selectedEncAlg,
        }

        let rabbitCipherdata = null;
        let rabbitKey = null;
        let rabbitIV = null;
        let rabbitTag = null;
        let rabbitHmacKey = null;

        if (selectedEncAlg === "Rabbit") {
            rabbitIV = new Uint8Array(16);
            crypto.getRandomValues(rabbitIV);

            rabbitKey = new Uint8Array(16);
            crypto.getRandomValues(rabbitKey);

            const aad = await utility.generateEncodedAAD(metadata, rabbitIV);
            rabbitHmacKey = await hmac.generateKey();

            const { cipherdata, tag } = (await rabbit.encrypt(fileBuffer, rabbitIV, rabbitKey, rabbitHmacKey, aad));
            rabbitCipherdata = cipherdata;
            rabbitTag = tag;
        }

        const worker = new Worker('/js/workers/encryption-worker.js', { type: 'module' });

        return new Promise((resolve) => {
            worker.postMessage({
                rabbitObj: {
                    cipherdata: rabbitCipherdata,
                    iv: rabbitIV,
                    key: rabbitKey,
                    tag: rabbitTag,
                    hmacKey: rabbitHmacKey
                },
                fileBuffer,
                keyBuffer,
                metadata,
                selectedKeySize,
                rsaKeySize,
                isCustomKeyEnabled,
                isKeyReusingEnabled,
                constants: {
                    AES_IV_SIZE,
                    CHACHA_IV_SIZE,
                    TWOFISH_IV_SIZE,
                }
            }, [fileBuffer]);

            worker.onerror = (e) => {
                console.error("Worker error:", e);
                worker.terminate();
            };

            worker.onmessage = async (e) => {
                const { success, result, error } = e.data;

                const elapsed = performance.now() - startTime;

                const MIN_DURATION = 2000;
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

                utility.createDownloadButton(JSON.stringify(encryptionOutput, null, 2), FileTypes.APP_JSON, file.name + FileDownloadNames.ENCRYPTED_FILE);

                if (!isCustomKeyEnabled && result.rsaKey?.privateKeyUint8Array) {
                    utility.createDownloadButton(result.rsaKey.privateKeyUint8Array, FileTypes.APP_OCTET, FileDownloadNames.DEC_KEY_FILE + rsaKeySize + ".key");
                }

                if (isKeyReusingEnabled && result.rsaKey?.publicKeyUint8Array) {
                    utility.createDownloadButton(result.rsaKey.publicKeyUint8Array, FileTypes.APP_OCTET, FileDownloadNames.ENC_KEY_FILE + rsaKeySize + ".key");
                }

                resolve("Success");
                worker.terminate();
            };
        });

    } catch (err) {
        document.getElementById('loader').classList.add('d-none');
        return "Error: " + err.message;
    }
};

export { initEncryption };

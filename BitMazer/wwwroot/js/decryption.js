import { BlobConstants } from '/js/constants/blob-types.js';
import { DomElements } from '/js/constants/domElements.js';
import { utility } from '/js/utility.js';
import { rsa } from '/js/algorithms/rsa.js';
import { rabbit } from '/js/algorithms/rabbit.js';

const {
    DEC_INPUT_FIELD,
    DEC_KEY_INPUT_FIELD
} = DomElements;

async function initDecryption () {
    try {
        utility.clearDownloadSection();

        const file = document.getElementById(DEC_INPUT_FIELD).files[0];
        const fileText = await file.text();
        const fileJson = JSON.parse(fileText);

        const keyFile = document.getElementById(DEC_KEY_INPUT_FIELD).files[0];
        const rsaKeyBuffer = await keyFile.arrayBuffer();

        let rabbitDecryptedData = null;
        if (fileJson.aad.algorithm === "Rabbit") {
            const iv = Uint8Array.from(atob(fileJson.aad.iv), c => c.charCodeAt(0));

            const encryptedKey = Uint8Array.from(atob(fileJson.key), c => c.charCodeAt(0));
            const rsaPrivateKey = await rsa.importPrivateKey(rsaKeyBuffer);
            const decryptedKeyRaw = await rsa.decrypt(rsaPrivateKey, encryptedKey);

            rabbitDecryptedData = rabbit.decrypt(fileJson.ciphertext, iv, decryptedKeyRaw);
        }

        const worker = new Worker('/js/workers/decryption-worker.js', { type: 'module' });

        return new Promise((resolve) => {
            worker.postMessage({
                rabbitDecryptedData,
                encryptionAlgorithm: fileJson.aad.algorithm,
                aadObject: fileJson.aad,
                key: fileJson.key,
                cipherdata: fileJson.cipherdata,
                tag: fileJson.tag ?? null,
                hmacKey: fileJson.hmacKey ?? null,
                rsaKeyBuffer
            }, [rsaKeyBuffer]);

            worker.onmessage = (e) => {
                if (e.data.type === 'log') {
                    console.log('[Worker]', e.data.data);
                }
                const { success, decryptedData, error } = e.data;

                if (!success) {
                    resolve("Error: " + error);
                    return;
                }

                utility.createDownloadButton(decryptedData, BlobConstants.APP_OCTET, fileJson.aad.fileName);
                resolve("Success");
                worker.terminate();
            };

            worker.onerror = (err) => {
                console.error("Worker error", err);
                resolve("Error: Decryption worker failed.");
                worker.terminate();
            };
        });
    } catch (err) {
        return "Error: " + err.message;
    }
};

export { initDecryption };

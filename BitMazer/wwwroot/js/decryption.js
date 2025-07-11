import { FileTypes } from '/js/constants/app-constants.js';
import { DomSelectors } from '/js/constants/app-constants.js';
import { utility } from '/js/utility.js';
import { rsa } from '/js/algorithms/rsa.js';
import { rabbit } from '/js/algorithms/rabbit.js';
import { hmac } from '/js/hmacUtilities.js';

const {
    DEC_INPUT_FIELD,
    DEC_KEY_INPUT_FIELD
} = DomSelectors;

async function initDecryption() {

    const startTime = performance.now();
    const loaderAnimation = document.getElementById('loader');
    loaderAnimation.classList.remove("d-none");

    try {
        utility.clearDownloadSection();
        document.getElementById('loader').classList.remove('d-none');

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
            let importedHmacKey, tagArr;
            if (fileJson.hmacKey && fileJson.tag) {
                const hmacKeyArr = Uint8Array.from(atob(fileJson.hmacKey), c => c.charCodeAt(0));
                tagArr = Uint8Array.from(atob(fileJson.tag), c => c.charCodeAt(0));
                importedHmacKey = await hmac.importKey(hmacKeyArr);
            }
            const encoder = new TextEncoder();
            const aad = encoder.encode(JSON.stringify(fileJson.aad));

            rabbitDecryptedData = await rabbit.decrypt(fileJson.cipherdata, iv, decryptedKeyRaw, importedHmacKey, tagArr, aad);
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
            }, [rabbitDecryptedData], [rsaKeyBuffer]);

            worker.onmessage = async (e) => {

                const { success, decryptedData, error } = e.data;

                const elapsed = performance.now() - startTime;

                const MIN_DURATION = 2000;
                const remainingTime = MIN_DURATION - elapsed;

                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }

                if (!success) {
                    resolve("Error: " + error);
                    return;
                }

                utility.createDownloadButton(decryptedData, FileTypes.APP_OCTET, fileJson.aad.fileName);
                document.getElementById('loader').classList.remove('d-none');

                resolve("Success");
                worker.terminate();
            };

            worker.onerror = (err) => {
                document.getElementById('loader').classList.add('d-none');
                reject(err);
                worker.terminate();
            };

            worker.onerror = (e) => {
                console.error("Worker error:", e);
                throw (e);
                document.getElementById('loader').classList.add('d-none');
                worker.terminate();
            };
        });
    } catch (err) {
        document.getElementById('loader').classList.add('d-none');
        return "Error: " + err.message;
    }
};

export { initDecryption };

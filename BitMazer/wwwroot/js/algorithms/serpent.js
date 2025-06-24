import { createSerpent } from './serpent-lib.js';

export const serpent = {
    generateKey: function (length) {
        const key = new Uint8Array(length);
        crypto.getRandomValues(key);
        return key;
    },
    encrypt: function (plainData, key) {
        try {
            const serpentAlg = createSerpent();

            const data = new Uint8Array(plainData);
            serpentAlg.open(key);

            for (let offset = 0; offset < data.length; offset += 16) {
                serpentAlg.encrypt(data, offset);
            }

            serpentAlg.close();
            return data;
        } catch (err) {
            console.error("Error encrypting file: ", err);
            return null;
        }
    },

    decrypt: function (cipherdata, key) {
        try {
            const serpentAlg = createSerpent();
            const data = new Uint8Array(cipherdata);;
            serpentAlg.open(key);

            for (let offset = 0; offset < data.length; offset += 16) {
                serpentAlg.decrypt(data, offset);
            }

            serpentAlg.close();
            return data;
        } catch (err) {
            console.error("Error decrypting file: ", err);
            return null;
        }
    },

    encryptBase64: function (base64, sampleIV) {
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const key = this.randomBytes(CHACHA_KEY_SIZE);
        const iv = new Uint8Array(sampleIV.slice(0, CHACHA_IV_SIZE));

        const encryptedData = this.encrypt(byteArray, iv, key);

        return utility.arrayBufferToBase64(encryptedData);
    }
};

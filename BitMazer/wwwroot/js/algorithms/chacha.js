/*
    Ensure that the input file, key and IV are in Uint8Array format
*/
import { CryptoConstants } from '../constants/crypto-constants.js';
import { utility } from '../utility.js';
import { streamXOR } from "https://esm.sh/@stablelib/chacha@2.0.1/es2022/chacha.mjs";
import { randomBytes } from "https://esm.sh/@stablelib/random@2.0.1/es2022/random.mjs";

const { CHACHA_KEY_SIZE, CHACHA_IV_SIZE } = CryptoConstants;

export const chacha = {
    randomBytes: function (size) {
        return randomBytes(size);
    },

    encrypt: function (fileBuffer, iv, key) {
        try {
            const encryptedData = new Uint8Array(fileBuffer.length);
            streamXOR(key, iv, fileBuffer, encryptedData);
            return encryptedData;
        } catch (err) {
            console.error("Error encrypting file: ", err);
            return null;
        }
    },

    decrypt: function (fileByteArray, iv, key) {
        try {
            const decryptedData = new Uint8Array(fileByteArray.length);
            streamXOR(key, iv, fileByteArray, decryptedData);
            return decryptedData;
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

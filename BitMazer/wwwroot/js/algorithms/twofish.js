import { twofish } from './twofish-lib.js';
import { CryptoConstants } from '../constants/crypto-constants.js';
const { TWOFISH_KEY_SIZE, TWOFISH_IV_SIZE } = CryptoConstants;

window.twofish = {
    generateIV: function (length) {
        const iv = new Uint8Array(length);
        window.crypto.getRandomValues(iv);
        return iv;
    },

    generateKey: function (length) {
        const key = new Uint8Array(length);
        window.crypto.getRandomValues(key);
        return key;
    },

    encrypt: function (fileBuffer, iv, key) {
        try {
            if (this.checkOperationParams(fileBuffer, iv, key) == false) {
                return null;
            }

            const tf = twofish(iv);
            const cipherdata = tf.encryptCBC(key, fileBuffer);

            return new Uint8Array(cipherdata);
        } catch (err) {
            console.error("Twofish encryption failed:", err);
            return null;
        }
    },

    decrypt: function (cipherdata, iv, key) {
        try {
            if (this.checkOperationParams(cipherdata, iv, key) == false) {
                return null;
            }

            const tf = twofish(iv);
            const plaintext = tf.decryptCBC(key, cipherdata);

            return new Uint8Array(plaintext);
        } catch (err) {
            console.error("Twofish decryption failed:", err);

            return null;
        }
    },

    checkOperationParams(data, iv, key) {
        if (!(data instanceof Uint8Array) ||
            !(iv instanceof Uint8Array) ||
            !(key instanceof Uint8Array) ||
            key.length !== TWOFISH_KEY_SIZE) {
            return false;
        }

        return true;
    },

    encryptBase64: function (base64, sampleIV) {
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const key = this.generateKey(TWOFISH_KEY_SIZE);
        const iv = new Uint8Array(sampleIV.slice(0, TWOFISH_IV_SIZE));

        const encryptedData = this.encrypt(byteArray, iv, key);

        return utility.arrayBufferToBase64(encryptedData);
    }
};
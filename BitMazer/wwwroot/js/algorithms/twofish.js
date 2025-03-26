import { twofish } from './twofish-lib.js';
import { CryptoConstants } from '../constants/crypto-constants.js';

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
            if (checkOperationParams(fileBuffer, iv, key) == false) {
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
            if (checkOperationParams(cipherdata, iv, key) == false) {
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
            key.length !== CryptoConstants.TWOFISH_KEY_SIZE) {
            return false;
        }

        return true;
    }
};
/*
    Ensure that the input file, key and IV are in Uint8Array format
*/
import { CryptoConstants } from '/js/constants/crypto-constants.js';
import { utility } from '/js/utility.js';
import { xchacha20poly1305 } from '/js/algorithms/chacha-lib/chacha-lib.js';

const { CHACHA_IV_SIZE } = CryptoConstants;

export const chacha = {
    encrypt: async function (plaindata, nonce, key, aad) {
        try {
            if (!key || !nonce) throw new Error("Key or nonce are not defined.");

            const chacha = aad ? xchacha20poly1305(key, nonce, aad) : xchacha20poly1305(key, nonce);
            const encrypted = chacha.encrypt(plaindata);

            return encrypted;

        } catch (err) {
            throw err;
            return null;
        }
    },

    decrypt: function (fileByteArray, nonce, key, aad) {
        try {
            if (!key || !nonce) throw new Error("Key or nonce are not defined.");

            const chacha = xchacha20poly1305(key, nonce, aad);
            const decrypted = chacha.decrypt(fileByteArray);

            return decrypted;
        } catch (err) {
            throw err;
            return null;
        }
    },

    encryptForAnalysis: async function (plaindata, baseIV, baseKey, keySize) {
        const iv = baseIV.slice(0, CHACHA_IV_SIZE);
        const key = baseKey.slice(0, keySize / 8);

        const encryptedData = await this.encrypt(plaindata, iv, key, null);
        const memoryUsage = utility.estimateMemoryFromBuffers(iv, key, plaindata, encryptedData)

        return { encryptedData, memoryUsage };
    }
};

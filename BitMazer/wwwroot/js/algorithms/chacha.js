/*
    Ensure that the input file, key and IV are in Uint8Array format
*/
import { CryptoConstants } from '../constants/crypto-constants.js';

window.chacha = {
    checkIfNaClLoaded: function () {
        if (typeof nacl === "undefined") {
            console.error("NaCl library is not loaded. Ensure TweetNaCl.js is included.");
            return false;
        }
        return true;
    },

    checkOperationParams: function (file, iv, key) {
        if ((file instanceof Uint8Array && iv instanceof Uint8Array && key instanceof Uint8Array) == false) {
            console.error("One or more from the provided IV, key or data are not in byte array format (Uint8Array).");
            return false;
        }
        if (key.length != CryptoConstants.CHACHA_KEY_SIZE || iv.length != CryptoConstants.CHACHA_IV_SIZE) {
            console.error("Check the iv and key size.");
            return false;
        }
        return true;
    },

    generateKey: function () {
        if (chacha.checkIfNaClLoaded() == false) return null;

        return nacl.randomBytes(CryptoConstants.CHACHA_KEY_SIZE);
    },

    encrypt: function (fileBuffer, iv, key) {
        try {
            if (chacha.checkIfNaClLoaded() == false || chacha.checkOperationParams(fileBuffer, iv, key) == false)
                return null;

            const encryptedData = nacl.secretbox(fileBuffer, iv, key);

            return encryptedData;
        } catch (err) {
            console.error("Error encrypting file: ", err);
            return null;
        }
    },

    decrypt: function (fileByteArray, iv, key) {
        try {
            if (chacha.checkIfNaClLoaded() == false || chacha.checkOperationParams(fileByteArray, iv, key) == false)
                return null;

            const decryptedData = nacl.secretbox.open(fileByteArray, iv, key);

            return decryptedData;
        } catch (err) {
            console.error("Error decrypting file: ", err);
            return null;
        }
    }
};

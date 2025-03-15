/*
    Ensure that the input file, key and IV are in Uint8Array format
*/
const CHACHA_KEY_SIZE = 32;
const CHACHA_IV_SIZE = 24;

window.chacha = {
    checkIfNaClLoaded: function () {
        if (typeof nacl === "undefined") {
            console.error("NaCl library is not loaded. Ensure TweetNaCl.js is included.");
            return false;
        }
        return true;
    },

    checkEncParams: function (file, iv, key) {
        if (typeof file != Uint8Array || typeof iv != Uint8Array || typeof key != Uint8Array) {
            console.error("One or more from the provided IV, key or data are not in byte array format (Uint8Array).");
            return false;
        }
        if (!file || !iv || !key || key.length != CHACHA_KEY_SIZE || iv.length != CHACHA_IV_SIZE) {
            console.error("The IV, key or data provided for encryption is invalid.");
            return false;
        }
        return true;
    },

    generateKey: function () {
        if (chacha.checkIfNaClLoaded() == false) return null;

        return nacl.randomBytes(CHACHA_KEY_SIZE);
    },

    encrypt: function (fileBuffer, iv, key) {
        try {
            if (chacha.checkIfNaClLoaded() == false || chacha.checkEncParams(fileBuffer, iv, key) == false)
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
            if (chacha.checkIfNaClLoaded() == false || chacha.checkEncParams(fileBuffer, iv, key) == false)
                return null;

            const decryptedData = nacl.secretbox.open(fileByteArray, iv, key);

            return decryptedData;
        } catch (err) {
            console.error("Error decrypting file: ", err);
            return null;
        }
    }
};

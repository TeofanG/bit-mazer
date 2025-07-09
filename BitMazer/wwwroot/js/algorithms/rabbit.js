/*
    Ensure that the input file, key and IV are in Uint8Array format
*/
import { CryptoConstants } from '/js/constants/crypto-constants.js';
import { utility } from '/js/utility.js';

const { RABBIT_IV_SIZE } = CryptoConstants;

export const rabbit = {
    encrypt: function (fileBuffer, iv, key) {
        try {
            const processedCiphertext = CryptoJS.lib.WordArray.create(new Uint8Array(fileBuffer));
            const processedIV = CryptoJS.lib.WordArray.create(new Uint8Array(iv));
            const processedKey = CryptoJS.lib.WordArray.create(new Uint8Array(key));

            const encrypted = CryptoJS.Rabbit.encrypt(processedCiphertext, processedKey, {
                iv: processedIV
            });

            const extractedCipherdata = utility.wordArrayToArrayBuffer(encrypted.ciphertext);

            return extractedCipherdata;

        } catch (err) {
            console.error("Error encrypting file: ", err);
            return null;
        }
    },

    decrypt: function (fileBuffer, iv, key) {
        try {
            const processedCiphertext = CryptoJS.enc.Base64.parse(fileBuffer);
            const processedIV = CryptoJS.lib.WordArray.create(new Uint8Array(iv));
            const processedKey = CryptoJS.lib.WordArray.create(new Uint8Array(key));

            const decryptedWordArray = CryptoJS.Rabbit.decrypt(
                { ciphertext: processedCiphertext }, 
                processedKey, 
                { iv: processedIV }
            );
            const rabbitDecryptedData = utility.wordArrayToUint8Array(decryptedWordArray);

            return rabbitDecryptedData;

        } catch (err) {
            console.error("Error decrypting file: ", err);
            return null;
        }
    },

    encryptForAnalysis: async function (plaindata, baseIV, baseKey, keySize) {
        const iv = baseIV.slice(0, RABBIT_IV_SIZE);
        const key = baseKey.slice(0, keySize / 8);

        const rabbitEncryptedData = this.encrypt(plaindata, iv, key);
        const rabbitMemoryUsage = utility.estimateMemoryFromBuffers(iv, key, plaindata, rabbitEncryptedData)

        return { rabbitEncryptedData, rabbitMemoryUsage };
    }
};

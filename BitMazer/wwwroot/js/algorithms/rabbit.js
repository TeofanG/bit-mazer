/*
    Ensure that the input file, key and IV are in Uint8Array format
*/
import { CryptoConstants } from '/js/constants/crypto-constants.js';
import { utility } from '/js/utility.js';
import { hmac } from '/js/hmacUtilities.js';

const { RABBIT_IV_SIZE } = CryptoConstants;

export const rabbit = {
    encrypt: async function (plaindata, iv, key, hmacKey, aad) {
        try {
            const processedCiphertext = CryptoJS.lib.WordArray.create(new Uint8Array(plaindata));
            const processedIV = CryptoJS.lib.WordArray.create(new Uint8Array(iv));
            const processedKey = CryptoJS.lib.WordArray.create(new Uint8Array(key));

            const encrypted = CryptoJS.Rabbit.encrypt(processedCiphertext, processedKey, {
                iv: processedIV
            });

            const cipherdata = utility.wordArrayToUint8Array(encrypted.ciphertext);

            if (hmacKey && aad) {
                const combined = new Uint8Array(aad.length + cipherdata.length);
                combined.set(aad, 0);
                combined.set(cipherdata, aad.length);

                const tag = new Uint8Array(await hmac.sign(hmacKey, combined));

                return { cipherdata, tag };

            } else {
                return cipherdata;
            }

        } catch (err) {
            console.error("Error encrypting file using Rabbit: ", err);
            throw err;
        }
    },

    decrypt: async function (cipherdata, iv, key, hmacKey, tag, aad) {
        try {
            const processedCiphertext = CryptoJS.enc.Base64.parse(cipherdata);
            const processedIV = CryptoJS.lib.WordArray.create(new Uint8Array(iv));
            const processedKey = CryptoJS.lib.WordArray.create(new Uint8Array(key));

            const cipherdataBytes = utility.wordArrayToUint8Array(processedCiphertext)
            if (hmacKey && tag && aad) {
                const combined = new Uint8Array(aad.length + cipherdataBytes.length);
                combined.set(aad, 0);
                combined.set(cipherdataBytes, aad.length);

                const isValid = await hmac.verify(hmacKey, tag, combined);
                if (!isValid) throw new Error("Invalid HMAC tag – authentication failed");
            }

            const decryptedWordArray = CryptoJS.Rabbit.decrypt(
                { ciphertext: processedCiphertext },
                processedKey,
                { iv: processedIV }
            );

            const plaindata = utility.wordArrayToUint8Array(decryptedWordArray);
            return plaindata;

        } catch (err) {
            console.error("Error decrypting file using Rabbit: ", err);
            throw err;
        }
    },

    encryptForAnalysis: async function (plaindata, baseIV, baseKey, keySize) {
        const iv = baseIV.slice(0, RABBIT_IV_SIZE);
        const key = baseKey.slice(0, keySize / 8);

        const rabbitEncryptedData = await this.encrypt(plaindata, iv, key);
        const rabbitMemoryUsage = utility.estimateMemoryFromBuffers(iv, key, plaindata, rabbitEncryptedData)

        return { rabbitEncryptedData, rabbitMemoryUsage };
    }
};

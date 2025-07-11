/*
    Ensure that the input file, key and IV are in Uint8Array format
*/
import { CryptoConstants } from '/js/constants/crypto-constants.js';
import { utility } from '/js/utility.js';

const { AES_IV_SIZE } = CryptoConstants;

export const aes = {
    getKey: async function (mode, length) {
        try {
            const key = await crypto.subtle.generateKey(
                {
                    name: mode,
                    length: length,
                },
                true, // if extractable
                ["encrypt", "decrypt"] // key usages
            );
            console.log("AES key generated successfully.");
            return key;
        } catch (err) {
            console.error("Error generating AES key:", err);
            throw new Error("Invalid file object.");
            return null;
        }
    },

    importKey: async function (aesRawKey) {
        try {
            const aesKey = await crypto.subtle.importKey(
                "raw", //can be "jwk" or "raw"
                aesRawKey,
                {
                    name: "AES-GCM",
                },
                false, //whether the key is extractable (i.e. can be used in exportKey)
                ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
            );

            return aesKey;
        } catch (err) {
            console.error(err);
        }
    },

    encrypt: async function (plainData, iv, key, aad) {
        try {
            if (!key || !iv) throw new Error("Key or IV are not defined.");

            const encrypted = await crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                    tagLength: 128,
                    ...(aad && { additionalData: aad })
                },
                key,
                plainData
            );

            return encrypted;

        } catch (err) {
            console.error("AES-GCM encryption failed:", err);
            throw err;
        }
    },

    decrypt: async function (encryptedData, iv, key, aad) {
        try {
            if (!key || !iv) throw new Error("Key or IV are not defined.");


            const decrypted = await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                    tagLength: 128,
                    additionalData: aad
                },
                key,
                encryptedData
            );
            return decrypted;

        } catch (err) {
            console.error("AES-GCM decryption failed:", err);
            throw err;
        }
    },

    encryptForAnalysis: async function (plaindata, baseIV, baseKey, keySize) {
        const iv = baseIV.slice(0, AES_IV_SIZE);
        const rawKey = baseKey.slice(0, keySize / 8);
        const importedKey = await this.importKey(rawKey);

        const encryptedData = await this.encrypt(plaindata, iv, importedKey, null);
        const memoryUsage = utility.estimateMemoryFromBuffers(iv, rawKey, plaindata, encryptedData)

        return { encryptedData, memoryUsage };
    }
}

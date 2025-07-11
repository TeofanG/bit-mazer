import { twofishCipher } from '/js/algorithms/twofish-lib/twofish-lib.js';
import { CryptoConstants } from '/js/constants/crypto-constants.js';
import { utility } from '/js/utility.js';
import { hmac } from '/js/hmacUtilities.js';

const { TWOFISH_IV_SIZE } = CryptoConstants;

export const twofish = {
    encrypt: async function (plaindata, iv, key, hmacKey, aad) {
        try {
            if (!key || !iv) throw new Error("Key or IV are not defined.");

            const tf = twofishCipher(iv);
            const cipherdataRaw = tf.encryptCBC(key, plaindata);
            const cipherdata = new Uint8Array(cipherdataRaw);

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
            console.error("Twofish encryption failed:", err);
            throw err;
        }
    },

    decrypt: async function (cipherdata, iv, key, hmacKey, tag, aad) {
        try {

            if (!key || !iv) throw new Error("Key or IV are not defined.");

            const tf = twofishCipher(iv);

            if (tag && aad) {
                const combined = new Uint8Array(aad.length + cipherdata.length);
                combined.set(aad, 0);
                combined.set(cipherdata, aad.length);

                const isValid = await hmac.verify(hmacKey, tag, combined);
                if (!isValid) throw new Error("Invalid HMAC tag – authentication failed");
            }  

            const plaindata = tf.decryptCBC(key, cipherdata);

            return new Uint8Array(plaindata);;

        } catch (err) {
            console.error("Twofish decryption failed:", err);
            throw err;
        }
    },

    encryptForAnalysis: async function (plaindata, baseIV, baseKey, keySize) {
        const iv = baseIV.slice(0, TWOFISH_IV_SIZE);
        const key = baseKey.slice(0, keySize / 8);

        const encryptedData = await this.encrypt(plaindata, iv, key);
        const memoryUsage = utility.estimateMemoryFromBuffers(iv, key, plaindata, encryptedData)

        return { encryptedData, memoryUsage };
    }
};
import { rsa } from '/js/algorithms/rsa.js';
import { aes } from '/js/algorithms/aes.js';
import { twofish } from '/js/algorithms/twofish.js';
import { chacha } from '/js/algorithms/chacha.js';
import { hmac } from '/js/hmacUtilities.js';

self.onmessage = async (e) => {
    try {
        const { rabbitDecryptedData, aadObject, key, cipherdata, tag, hmacKey, rsaKeyBuffer } = e.data;

        let hmacKeyArr = null, tagArr = null, importedHmacKey = null;

        if (hmacKey && tag) {
            hmacKeyArr = Uint8Array.from(atob(hmacKey), c => c.charCodeAt(0));
            tagArr = Uint8Array.from(atob(tag), c => c.charCodeAt(0));
            importedHmacKey = await hmac.importKey(hmacKeyArr);
        }

        const iv = Uint8Array.from(atob(aadObject.iv), c => c.charCodeAt(0));
        const encryptedKey = Uint8Array.from(atob(key), c => c.charCodeAt(0));
        const encryptedData = Uint8Array.from(atob(cipherdata), c => c.charCodeAt(0));

        const rsaPrivateKey = await rsa.importPrivateKey(rsaKeyBuffer);
        const decryptedKeyRaw = await rsa.decrypt(rsaPrivateKey, encryptedKey);
        const decryptedKeyByteArr = new Uint8Array(decryptedKeyRaw);

        let decryptedData;

        const encoder = new TextEncoder();
        const aad = encoder.encode(JSON.stringify(aadObject));

        switch (aadObject.algorithm) {
            case "AES_GCM":
                const aesKey = await aes.importKey(decryptedKeyByteArr);
                decryptedData = await aes.decrypt(encryptedData.buffer, iv, aesKey, aad);
                break;
            case "XChaCha20_Poly1305":
                decryptedData = chacha.decrypt(encryptedData, iv, decryptedKeyByteArr, aad);
                break;
            case "Rabbit":
                decryptedData = rabbitDecryptedData;
                break;
            case "Twofish":
                decryptedData = await twofish.decrypt(encryptedData, iv, decryptedKeyByteArr, importedHmacKey, tagArr, aad);
                break;
            default:
                throw new Error("Unknown algorithm: " + aadObject.algorithm);
        }

        self.postMessage({ success: true, decryptedData });

    } catch (err) {
        self.postMessage({ success: false, error: err.message || "Unknown error during decryption." });
    }
};

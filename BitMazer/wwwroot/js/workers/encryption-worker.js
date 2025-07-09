import { aes } from '/js/algorithms/aes.js';
import { chacha } from '/js/algorithms/chacha.js';
import { twofish } from '/js/algorithms/twofish.js';
import { rsa } from '/js/algorithms/rsa.js';
import { utility } from '/js/utility.js';
import { hmac } from '/js/hmacUtilities.js';
import { CryptoConstants } from '/js/constants/crypto-constants.js';

self.onmessage = async (e) => {
    const {
        rabbitObj,
        fileBuffer,
        keyBuffer,
        metadata,
        selectedKeySize,
        rsaKeySize,
        isCustomKeyEnabled,
        isKeyReusingEnabled,
    } = e.data;

    const {
        AES_NAME,
        AES_IV_SIZE,
        CHACHA_IV_SIZE,
        TWOFISH_IV_SIZE,
    } = CryptoConstants;

    try {
        const keySizeBytes = selectedKeySize / 8;
        let iv, encKey, cipherdata, aad;
        let tag = null, hmacKey = null, exportedHmacKey = null;

        switch (metadata.algorithm) {
            case "AES_GCM":
                iv = crypto.getRandomValues(new Uint8Array(AES_IV_SIZE));
                const aesKey = await aes.getKey(AES_NAME, selectedKeySize);
                aad = await utility.generateEncodedAAD(metadata, iv);
                cipherdata = await aes.encrypt(fileBuffer, iv, aesKey, aad);
                encKey = await crypto.subtle.exportKey("raw", aesKey);
                break;

            case "XChaCha20_Poly1305":
                iv = crypto.getRandomValues(new Uint8Array(CHACHA_IV_SIZE));
                encKey = crypto.getRandomValues(new Uint8Array(keySizeBytes));
                aad = await utility.generateEncodedAAD(metadata, iv);

                cipherdata = await chacha.encrypt(new Uint8Array(fileBuffer), iv, encKey, aad);
                break;

            case "Rabbit":
                iv = rabbitObj.iv;
                encKey = rabbitObj.key;
                cipherdata = rabbitObj.cipherdata;
                break;

            case "Twofish":
                iv = new Uint8Array((TWOFISH_IV_SIZE));
                crypto.getRandomValues(iv);

                encKey = new Uint8Array((keySizeBytes));
                crypto.getRandomValues(encKey);

                aad = await utility.generateEncodedAAD(metadata, iv);

                hmacKey = await hmac.generateKey();
                ({ cipherdata, tag } = await twofish.encrypt(new Uint8Array(fileBuffer), iv, encKey, hmacKey, aad));
                break;

            default:
                throw new Error(`Unknown encryption algorithm: ${metadata.algorithm}`);
        }

        const rsaKey = await rsa.getKey(rsaKeySize, isCustomKeyEnabled, keyBuffer);
        let publicRSAKey = isCustomKeyEnabled ? rsaKey : rsaKey.publicKey;
        const encryptedKey = await rsa.encrypt(publicRSAKey, encKey);

        if (hmacKey) {
            exportedHmacKey = await hmac.exportKey(hmacKey);
        }

        const result = {
            cipherdata: await utility.arrayBufferToBase64(cipherdata),
            encryptedKey: await utility.arrayBufferToBase64(encryptedKey),
            iv: await utility.arrayBufferToBase64(iv),
            tag: tag ? await utility.arrayBufferToBase64(tag) : null,
            hmacKey: hmacKey ? await utility.arrayBufferToBase64(exportedHmacKey) : null,
            rsaKey: isCustomKeyEnabled ? null : await rsa.exportKeyPairToByteArr(rsaKey),
            isCustomKeyEnabled,
            isKeyReusingEnabled
        };

        self.postMessage({ success: true, result });
    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};

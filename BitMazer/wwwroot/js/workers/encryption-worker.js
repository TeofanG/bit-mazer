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
        AES_IV_SIZE,
        CHACHA_IV_SIZE,
        TWOFISH_IV_SIZE,
    } = CryptoConstants;

    try {
        const keySizeBytes = selectedKeySize / 8;
        let rsaKeyPair, encryptionKey, rsaPublicKey;
        let cipherdata, iv, aad;
        let tag = null, hmacKey = null, exportedHmacKey = null;

        if (isCustomKeyEnabled) {
            rsaPublicKey = await rsa.importPublicKey(keyBuffer);
            if (!rsaPublicKey) throw new Error("Failure to import RSA public key.");
        } else {
            rsaKeyPair = await rsa.generateKey(rsaKeySize);
            if (!rsaKeyPair) throw new Error("Failed to generate RSA key pair.");
            rsaPublicKey = rsaKeyPair.publicKey;
        }

        switch (metadata.algorithm) {
            case "AES_GCM":
                iv = crypto.getRandomValues(new Uint8Array(AES_IV_SIZE));
                const aesKey = await aes.getKey("AES-GCM", selectedKeySize);
                aad = await utility.generateEncodedAAD(metadata, iv);
                cipherdata = await aes.encrypt(fileBuffer, iv, aesKey, aad);
                encryptionKey = await crypto.subtle.exportKey("raw", aesKey);
                break;

            case "XChaCha20_Poly1305":
                iv = crypto.getRandomValues(new Uint8Array(CHACHA_IV_SIZE));
                encryptionKey = crypto.getRandomValues(new Uint8Array(keySizeBytes));
                aad = await utility.generateEncodedAAD(metadata, iv);

                cipherdata = await chacha.encrypt(new Uint8Array(fileBuffer), iv, encryptionKey, aad);
                break;

            case "Rabbit":
                iv = rabbitObj.iv;
                encryptionKey = rabbitObj.key;
                cipherdata = rabbitObj.cipherdata;
                tag = rabbitObj.tag;
                hmacKey = rabbitObj.hmacKey;
                break;

            case "Twofish":
                iv = new Uint8Array((TWOFISH_IV_SIZE));
                crypto.getRandomValues(iv);

                encryptionKey = new Uint8Array((keySizeBytes));
                crypto.getRandomValues(encryptionKey);

                aad = await utility.generateEncodedAAD(metadata, iv);
                hmacKey = await hmac.generateKey();

                ({ cipherdata, tag } = await twofish.encrypt(new Uint8Array(fileBuffer), iv, encryptionKey, hmacKey, aad));
                break;

            default:
                throw new Error(`Unknown encryption algorithm: ${metadata.algorithm}`);
        }

        const encryptedKey = await rsa.encrypt(rsaPublicKey, encryptionKey);

        if (hmacKey) {
            exportedHmacKey = await hmac.exportKey(hmacKey);
        }

        const result = {
            cipherdata: await utility.arrayBufferToBase64(cipherdata),
            encryptedKey: await utility.arrayBufferToBase64(encryptedKey),
            iv: await utility.arrayBufferToBase64(iv),
            tag: tag ? await utility.arrayBufferToBase64(tag) : null,
            hmacKey: hmacKey ? await utility.arrayBufferToBase64(exportedHmacKey) : null,
            rsaKey: isCustomKeyEnabled ? null : await rsa.exportKeyPairToByteArr(rsaKeyPair),
            isCustomKeyEnabled,
            isKeyReusingEnabled
        };

        self.postMessage({ success: true, result });
    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};

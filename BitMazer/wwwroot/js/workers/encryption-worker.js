import { aes } from '../algorithms/aes.js';
import { chacha } from '../algorithms/chacha.js';
import { twofish } from '../algorithms/twofish.js';
import { serpent } from '../algorithms/serpent.js';
import { rsa } from '../algorithms/rsa.js';
import { utility } from '../utility.js';
import { CryptoConstants } from '../constants/crypto-constants.js';

self.onmessage = async (e) => {
    const {
        fileBuffer,
        keyBuffer,
        selectedEncAlg,
        selectedKeySize,
        isCustomKeyEnabled,
        isKeyReusingEnabled,
    } = e.data;

    const {
        AES_NAME, AES_IV_SIZE,
        CHACHA_IV_SIZE,
        SERPENT_IV_SIZE,
        TWOFISH_IV_SIZE,
    } = CryptoConstants;

    try {
        let iv, encKey, ciphertext;
        const keySizeBytes = selectedKeySize / 8;
        switch (selectedEncAlg) {
            case "AES_GCM":
                encKey = await aes.getKey(AES_NAME, selectedKeySize);
                iv = crypto.getRandomValues(new Uint8Array(AES_IV_SIZE));
                ciphertext = await aes.encrypt(fileBuffer, iv, encKey);
                encKey = await crypto.subtle.exportKey("raw", encKey);
                break;

            case "ChaCha20":
                iv = chacha.randomBytes(CHACHA_IV_SIZE);
                encKey = chacha.randomBytes(keySizeBytes);
                ciphertext = chacha.encrypt(new Uint8Array(fileBuffer), iv, encKey);
                break;

            case "Serpent":
                encKey = serpent.generateKey(keySizeBytes);
                ciphertext = serpent.encrypt(new Uint8Array(fileBuffer), encKey);
                break;

            case "Twofish":
                iv = twofish.generateIV(TWOFISH_IV_SIZE);
                encKey = twofish.generateKey(keySizeBytes);
                ciphertext = twofish.encrypt(new Uint8Array(fileBuffer), iv, encKey);
                break;

            default:
                throw new Error(`Unknown encryption algorithm: ${selectedEncAlg}`);
        }

        const rsaKey = await rsa.getKey(isCustomKeyEnabled, keyBuffer);
        let publicRSAKey = isCustomKeyEnabled ? rsaKey : rsaKey.publicKey;
        const encryptedKey = await rsa.encrypt(publicRSAKey, encKey);

        const result = {
            iv: utility.arrayBufferToBase64(iv),
            encryptedKey: utility.arrayBufferToBase64(encryptedKey),
            ciphertext: utility.arrayBufferToBase64(ciphertext),
            rsaKey: isCustomKeyEnabled ? null : await rsa.exportKeysToFiles(rsaKey),
            isCustomKeyEnabled,
            isKeyReusingEnabled
        };

        self.postMessage({ success: true, result });
    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};

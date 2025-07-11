import { aes } from '/js/algorithms/aes.js';
import { chacha } from '/js/algorithms/chacha.js';
import { twofish } from '/js/algorithms/twofish.js';

self.onmessage = async function (e) {
    const { rabbitEncryptedData, rabbitMemoryUsage, rabbitEncTime, algorithm, plaindata, baseIV, baseKey, keySize } = e.data;
    
    try {
        const startTime = performance.now();
        let encryptedData, memoryUsage;

        switch (algorithm) {
            case 'AES_GCM':
                ({ encryptedData, memoryUsage } = await aes.encryptForAnalysis(plaindata, baseIV, baseKey, keySize));
                break;
            case 'XChaCha20_Poly1305':
                ({ encryptedData, memoryUsage } = await chacha.encryptForAnalysis(plaindata, baseIV, baseKey, keySize));
                break;
            case 'Rabbit':
                encryptedData = rabbitEncryptedData;
                memoryUsage = rabbitMemoryUsage
                break;
            case 'Twofish':
                ({ encryptedData, memoryUsage } = await twofish.encryptForAnalysis(plaindata, baseIV, baseKey, keySize));
                break;
            default:
                throw new Error("Unsupported algorithm: " + algorithm);
        }
        const endTime = performance.now();

        const elapsedTimeMs = algorithm === "Rabbit"
            ? rabbitEncTime
            : Math.round((endTime - startTime) * 100) / 100;

        self.postMessage({
            success: true,
            encrypted: new Uint8Array(encryptedData),
            memoryUsed: memoryUsage,
            elapsedTimeMs,
        });
    } catch (err) {
        self.postMessage({
            success: false, error: err instanceof Error ? err.message : String(err) });
    }
};

import { aes } from '../algorithms/aes.js';
import { chacha } from '../algorithms/chacha.js';
import { twofish } from '../algorithms/twofish.js';
function estimateBytes(...buffers) {
    return buffers.reduce((sum, buf) => {
        if (typeof buf === 'string') {
            return sum + (new TextEncoder().encode(buf)).byteLength;
        }
        return sum + (buf?.byteLength || 0);
    }, 0);
}

self.onmessage = async function (e) {
    const { base64, algorithm, iv } = e.data;

    const startTime = performance.now();
    try {
        let result;

        switch (algorithm) {
            case 'AES_GCM':
                result = await aes.encryptBase64(base64, iv);
                break;
            case 'ChaCha20':
                result = await chacha.encryptBase64(base64, iv);
                break;
            case 'Twofish':
                result = await twofish.encryptBase64(base64, iv);
                break;
            default:
                throw new Error("Unsupported algorithm: " + algorithm);
        }
        const endTime = performance.now();

        const memoryUsed = estimateBytes(result);
        const elapsedTimeMs = Math.round(endTime - startTime);

        self.postMessage({
            success: true,
            encrypted: result,
            memoryUsed: memoryUsed / (1024 * 1024),
            elapsedTimeMs
        });
    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};

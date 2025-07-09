import { rabbit } from '/js/algorithms/rabbit.js';

async function startEncryptionAnalysisWorker(algorithm, plaindata, baseIV, baseKey, keySize, dotNetHelper) {
    let rabbitEncryptedData;
    let rabbitMemoryUsage;
    let rabbitEncTime;

    if (algorithm === "Rabbit") {
        const startTime = performance.now();
        ({ rabbitEncryptedData, rabbitMemoryUsage } = await rabbit.encryptForAnalysis(plaindata, baseIV, baseKey, keySize));
        const endTime = performance.now();
        rabbitEncTime = Math.round(endTime - startTime);
    }

    const worker = new Worker('/js/workers/analysis-worker.js', { type: 'module' });

    worker.onmessage = (e) => {
        const { success, encrypted, error, memoryUsed, elapsedTimeMs } = e.data;

        if (success) {
            dotNetHelper.invokeMethodAsync('OnEncryptedFromWorker', {
                encrypted,
                memoryUsed,
                elapsedTimeMs
            });
        } else {
            dotNetHelper.invokeMethodAsync('OnEncryptionError', error);
        }

        worker.terminate();
    };

    worker.onerror = (e) => {
        console.error("Worker error:", e);
        dotNetHelper.invokeMethodAsync('OnEncryptionError', e.message || "Unknown worker error");
        worker.terminate(); 
    };

    worker.postMessage({
        rabbitEncryptedData,
        rabbitMemoryUsage,
        rabbitEncTime,
        algorithm,
        plaindata,
        baseIV,
        baseKey,
        keySize
    });
};

export { startEncryptionAnalysisWorker };

let encryptWorker;

window.startEncryptionWorker = (base64, algorithm, iv, dotNetHelper) => {
    if (!encryptWorker) {
        encryptWorker = new Worker('/js/workers/analysis-worker.js', { type: 'module' });

    }

    encryptWorker.onmessage = (e) => {
        const { success, encrypted, error, memoryUsed, elapsedTimeMs } = e.data;
        if (success) {
            dotNetHelper.invokeMethodAsync('OnEncryptedFromWorker', encrypted, memoryUsed, elapsedTimeMs);
        } else {
            dotNetHelper.invokeMethodAsync('OnEncryptionError', error);
        }
    };

    encryptWorker.postMessage({ base64, algorithm, iv });
};

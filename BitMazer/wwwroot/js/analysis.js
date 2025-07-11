import { rabbit } from '/js/algorithms/rabbit.js';
import { MIN_DURATION }  from '/js/constants/app-constants.js';

async function startAnalysisWorker(algorithm, plaindata, baseIV, baseKey, keySize, dotNetHelper) {

    const loaderAnimation = document.getElementById('loader');
    if (loaderAnimation) loaderAnimation.classList.remove("d-none");

    let worker = null;
    const startTime = performance.now();
    try {
        let rabbitEncryptedData;
        let rabbitMemoryUsage;
        let rabbitEncTime;

        if (algorithm === "Rabbit") {
            const start = performance.now();
            ({ rabbitEncryptedData, rabbitMemoryUsage } = await rabbit.encryptForAnalysis(plaindata, baseIV, baseKey, keySize));
            const end = performance.now();
            rabbitEncTime = Math.round(end - start);
        }

        const worker = new Worker('/js/workers/analysis-worker.js', { type: 'module' });

        const transferList = [
            plaindata.buffer,
            baseIV.buffer,
            baseKey.buffer
        ];

        if (rabbitEncryptedData) {
            transferList.push(rabbitEncryptedData.buffer);
        }

        worker.postMessage({
            rabbitEncryptedData,
            rabbitMemoryUsage,
            rabbitEncTime,
            algorithm,
            plaindata,
            baseIV,
            baseKey,
            keySize,
        }, transferList);

        worker.onmessage = async (e) => {
            const { success, encrypted, error, memoryUsed, elapsedTimeMs } = e.data;

            const elapsed = performance.now() - startTime;

            const remainingTime = MIN_DURATION - elapsed;

            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            if (loaderAnimation) {
                loaderAnimation.classList.add('d-none');
            }

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
            dotNetHelper.invokeMethodAsync('OnEncryptionError', e.message || e || "Unknown worker error");
            if (loaderAnimation) {
                loaderAnimation.classList.add('d-none');
            }
            worker.terminate();
        };

    } catch (err) {
        if (loaderAnimation) {
            loaderAnimation.classList.add('d-none');
        }
        return "Error: " + err.message;

        if (worker) {
            worker.terminate();
        }
    }
};

export { startAnalysisWorker };

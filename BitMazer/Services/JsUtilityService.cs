using BitMazer.Pages;
using Microsoft.JSInterop;

namespace BitMazer.Services
{
    public class JsUtilityService
    {

        private readonly IJSRuntime _jsRuntime;

        private IJSObjectReference? _utilityModule;
        private IJSObjectReference? _encryptionModule;
        private IJSObjectReference? _decryptionModule;
        private IJSObjectReference? _analysisModule;

        public JsUtilityService(IJSRuntime jsRuntime)
        {
            _jsRuntime = jsRuntime;
        }
        public async Task<IJSObjectReference> LoadEncryptionModuleAsync()
        {
            if (_encryptionModule == null)
            {
                _encryptionModule ??= await _jsRuntime.InvokeAsync<IJSObjectReference>("import", "/js/encryption.js");
                return _encryptionModule;
            }
            return _encryptionModule;
        }

        public async Task<IJSObjectReference> LoadDecryptionModuleAsync()
        {
            if (_decryptionModule == null)
            {
                _decryptionModule ??= await _jsRuntime.InvokeAsync<IJSObjectReference>("import", "/js/decryption.js");
                return _decryptionModule;
            }
            return _decryptionModule;
        }

        public async Task<IJSObjectReference> LoadAnalysisModuleAsync()
        {
            if (_analysisModule == null)
            {
                _analysisModule ??= await _jsRuntime.InvokeAsync<IJSObjectReference>("import", "/js/analysis.js");
                return _analysisModule;
            }
            return _analysisModule;
        }

        public async Task<IJSObjectReference> LoadUtilityModuleAsync()
        {
            if (_utilityModule == null)
            {
                _utilityModule ??= await _jsRuntime.InvokeAsync<IJSObjectReference>("import", "/js/utility.js");
                return _utilityModule;
            }
            return _utilityModule;
        }

        public async Task<string> InitEncryptionAsync(string algorithm, int keySize, int rsaKeySize ,bool customKey, bool reuseKey)
        {
            var module = await LoadEncryptionModuleAsync();
            return await module.InvokeAsync<string>("initEncryption", algorithm, keySize, rsaKeySize, customKey, reuseKey);
        }

        public async Task<string> InitDecryptionAsync()
        {
            var module = await LoadDecryptionModuleAsync();
            return await module.InvokeAsync<string>("initDecryption");
        }

        public async Task<string> InitAnalysisAsync(string alg, byte[] plaindata, byte[] baseIV, byte[] baseKey, int keySize, DotNetObjectReference<Analysis> dotNetRef)
        {
            var module = await LoadAnalysisModuleAsync();
            return await module.InvokeAsync<string>("startAnalysisWorker", alg, plaindata, baseIV, baseKey, keySize, dotNetRef);
        }

        public async Task ClearDownloadSectionAsync()
        {
            var module = await LoadUtilityModuleAsync();
            await module.InvokeVoidAsync("utility.clearDownloadSection");
        }

        public async Task<string> ExtractMetadataFromFileAsync()
        {
            var module = await LoadUtilityModuleAsync();
            return await module.InvokeAsync<string>("utility.extractMetadataFromFile");
        }
    }
}

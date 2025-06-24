using Microsoft.JSInterop;
using System.Threading.Tasks;

public class JsUtilityService
{
    private readonly IJSRuntime _jsRuntime;
    private IJSObjectReference? _module;

    public JsUtilityService(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }

    private async Task<IJSObjectReference> LoadModuleAsync()
    {
        if (_module == null)
        {
            _module = await _jsRuntime.InvokeAsync<IJSObjectReference>("import", "/js/utility.js");
        }
        return _module;
    }

    public async Task ClearDownloadSectionAsync()
    {
        var module = await LoadModuleAsync();
        await module.InvokeVoidAsync("utility.clearDownloadSection");
    }

    public async Task<string> ExtractMetadataFromFileAsync()
    {
        var module = await LoadModuleAsync();
        return await module.InvokeAsync<string>("utility.extractMetadataFromFile");
    }
}

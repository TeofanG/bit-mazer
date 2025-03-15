using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;

namespace BitMazer.Models
{
    public class FileModel
    {

        public FileModel(IBrowserFile file)
        {
            this.Name = file.Name ?? "Unknown";
            this.Type = file.ContentType ?? "unknown";
            this.Size = (float)Math.Round((file.Size / 1024.0 / 1024.0), 2);
        }

        public string Name { get; set; } = "Unknown";
        public float Size { get; set; }
        public string Type { get; set; } = "unknown";
    }
}

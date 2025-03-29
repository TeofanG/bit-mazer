using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using System.Security.Cryptography;

namespace BitMazer.Models
{
    public class FileModel
    {

        public FileModel(IBrowserFile file)
        {
            this.IBrowserFile = file;
            this.ByteArrayFile = Array.Empty<byte>();
            this.Base64File = string.Empty;
            this.IBrowserFile = file;
            this.Name = file.Name;
            this.Type = file.ContentType;
            this.Size = (float)Math.Round((file.Size / 1024.0 / 1024.0), 2);
        }

        public string Name { get; set; }
        public float Size { get; set; }
        public string Type { get; set; }

        public IBrowserFile IBrowserFile { get; set; }
        public byte[] ByteArrayFile { get; private set; }
        public string Base64File { get; private set; }

        /// <summary>
        /// Load file content into byte array and base64 string
        /// Call this before accessing ByteArrayFile or Base64File
        /// </summary>
        public async Task LoadAsync()
        {
            using var stream = this.IBrowserFile.OpenReadStream(maxAllowedSize: 256 * 1024 * 1024);
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            this.ByteArrayFile = ms.ToArray();
            this.Base64File = Convert.ToBase64String(ByteArrayFile);
        }
    }
}

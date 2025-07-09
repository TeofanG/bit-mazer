using Microsoft.Extensions.FileSystemGlobbing;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BitMazer.Models
{
    public class FileMetadataModel(string fileName, string fileType, float fileSize, string encAlg)
    {
        [JsonPropertyName("fileName")]
        public string FileName { get; set; } = fileName;

        [JsonPropertyName("fileType")]
        public string FileType { get; set; } = fileType;

        [JsonPropertyName("fileSize")]
        public float FileSize { get; set; } = (float)Math.Round((fileSize / 1024.0 / 1024.0), 2);

        [JsonPropertyName("algorithm")]
        public string EncAlg { get; set; } = encAlg;
    }
}

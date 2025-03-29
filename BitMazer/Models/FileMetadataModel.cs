using Microsoft.Extensions.FileSystemGlobbing;
using System.Text;
using System.Text.Json;

namespace BitMazer.Models
{
    public class FileMetadataModel(string fileName, string fileType, float fileSize, string encAlg)
    {
        public string FileName { get; set; } = fileName;

        public string FileType { get; set; } = fileType;

        public float FileSize { get; set; } = (float)Math.Round((fileSize / 1024.0 / 1024.0), 2);

        public string EncAlg { get; set; } = encAlg;
    }
}

using Microsoft.Extensions.FileSystemGlobbing;
using System.Text;
using System.Text.Json;

namespace BitMazer.Models
{
    public class FileMetadataModel
    {

        public FileMetadataModel(string fileName, string fileType, float fileSize, string encAlg)
        {
            this.fileName = fileName;
            this.fileType = fileType;
            this.fileSize = (float)Math.Round((fileSize / 1024.0 / 1024.0), 2);
            this.encAlg = encAlg;
        }

        public string fileName { get; set; }

        public string fileType { get; set; }

        public float fileSize { get; set; }

        public string encAlg { get; set; }
    }
}

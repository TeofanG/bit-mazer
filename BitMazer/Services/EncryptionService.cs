/*using BitMazer.Models;
using BitMazer.Algorithms;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Microsoft.JSInterop;

namespace BitMazer.Services
{
    public class EncryptionService
    {
        private static IJSRuntime? js;

        public static void Initialize(IJSRuntime jsRuntime)
        {
            js = jsRuntime;
        }

        public static string CreateDownloadUrl(byte[] file)
        {
            // Convert file bytes into a downloadable data URL
            var base64 = Convert.ToBase64String(file);
            var mimeType = "application/octet-stream"; // General-purpose binary data MIME type

            string downloadUrl = $"data:{mimeType};base64,{base64}";

            return downloadUrl;
        }

        public static byte[] CreateMetadata(int keyLength)
        {
            if (InputFile == null)
            {
                throw new ArgumentNullException(nameof(InputFile.Data), "Input file data cannot be null.");
            }

            FileMetadataModel fileMetadata = new FileMetadataModel(
                InputFile!.Name,
                InputFile!.Type, 
                (int)InputFile.Size, 
                EncryptionAlg,
                keyLength
                );
            return fileMetadata.ToByteArray();
        }

        public (byte[],byte[]) Encrypt()
        {
            if (InputFile?.Data == null)
            {
                throw new ArgumentNullException(nameof(InputFile.Data), "Input file data cannot be null.");
            }
            
            byte[] plaindata = InputFile.Data;

            (byte[], byte[]) encData;

            switch (EncryptionAlg)
            {
                case string alg when alg == EncryptionAlgorithm.ChaCha20.ToString():
                    encData = ChaCha20encryption.Encrypt(plaindata);
                    break;
                case string alg when alg == EncryptionAlgorithm.AES.ToString():
                    encData = AESEncryption.Encrypt(plaindata);
                    break;
                default:
                    throw new NotSupportedException($"Algorithm {EncryptionAlg} is not supported.");
            }

            return encData;
}

        public static byte[] EncryptKeyWithRSA(byte[] key, byte[] fileWithMetadata)
        {
            return fileWithMetadata.Concat(key).ToArray();
        }

        private static async AsymmetricCipherKeyPair GetRSAkeyPair()
        {
            AsymmetricCipherKeyPair keyPair;
            if (IsCustomPassEnabled == true)
            {
                if (InputPassword!.Data != null)
                {
                    keyPair = RSAencryption.ConvertByteArrayToKeyPair(InputPassword.Data);
                }
                else
                {
                    throw new Exception();
                }
            } else
            {
                keyPair =  js!.InvokeAsync<AsymmetricCipherKeyPair>("generateRSAkey");
            }

            return keyPair;
        }

        public static void StartEncryption()
        {
            if (InputFile != null)
            {
                AsymmetricCipherKeyPair rsaKeyPair = GetRSAkeyPair();
                byte[] RSAencryptedkey;
                byte[] metadataBytes;

                (byte[] file, byte[] key) = Encrypt();

                    
                //encrypt the key before adding it to the final encrypted file
                if(rsaKeyPair!= null && rsaKeyPair.Public != null && rsaKeyPair.Private != null)
                {
                    RsaKeyParameters rsaPublicKey = (RsaKeyParameters)rsaKeyPair.Public;
                    RSAencryptedkey = RSAencryption.Encrypt(key, rsaPublicKey);
                    //add to metadata the length of the key
                    metadataBytes = CreateMetadata(RSAencryptedkey.Length);

                    //append metadata size as a single byte
                    byte[] metadataSize = [(byte)metadataBytes.Length];
                    byte[] outputFile = [.. metadataSize, .. metadataBytes, .. RSAencryptedkey, .. file];

                    FileDownloadUrl = CreateDownloadUrl(outputFile);
                    KeyDownloadUrl = CreateDownloadUrl(RSAencryption.ConvertKeyPairToByteArray(rsaKeyPair));
                }
            }
        }

        public static void ResetFields()
        {
            FileDownloadUrl = string.Empty;
            KeyDownloadUrl = string.Empty;
            IsCustomPassEnabled = false;
            InputPassword = null;
            InputFile = null;
            EncryptionAlg = EncryptionAlgorithm.AES.ToString();
        }
        public static string FileDownloadUrl { get; set; } = string.Empty;
        public static string KeyDownloadUrl { get; set; } = string.Empty;
        public static bool IsCustomPassEnabled { get; set; } = false;

        public static FileModel? InputFile { get; set; } 
        public static FileModel? InputPassword{ get; set; }

        public static string EncryptionAlg { get; set; } = "AES";

        public static int progress = 0;
    }
}
*/
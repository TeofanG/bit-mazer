//using System.Security.Cryptography;
//using System.Text;
//using BitMazer.Models;
//using BitMazer.Algorithms;
//using Org.BouncyCastle.Crypto;
//using Org.BouncyCastle.Crypto.Encodings;
//using Org.BouncyCastle.Crypto.Engines;
//using Org.BouncyCastle.Crypto.Parameters;

//namespace BitMazer.Services
//{
//    public static class DecryptionService
//    {
//        public static void ResetFields()
//        {
//            FileDownloadUrl = string.Empty;
//            InputPassword = null;
//            InputFile = null;
//        }

//        public static byte[] Decrypt(byte[] key, byte[] data)
//        {
//            byte[] decryptedData;
//            try
//            {
//                switch (Metadata?.encAlg)
//                {
//                    case string alg when alg == EncryptionAlgorithm.ChaCha20.ToString():
//                        decryptedData = ChaCha20encryption.Decrypt(key, data);
//                        break;
//                    case string alg when alg == EncryptionAlgorithm.AES_GCM.ToString():
//                        decryptedData = AESEncryption.Decrypt(key, data);
//                        break;
//                    default:
//                        throw new NotSupportedException($"Algorithm {Metadata?.encAlg} is not supported.");
//                }
//            }
//            catch (InvalidCipherTextException ex)
//            {
//                Console.WriteLine("Couldnt decrypt: " + ex.Message);
//                throw new CryptographicException("Decryption failed", ex);
//            }

//            return decryptedData;
//        }

//        public static void ExtractMetadata(FileModel InputFile)
//        {
//            if (InputFile == null || InputFile.Data == null)
//            {
//                throw new ArgumentNullException(nameof(InputFile),"Input file datat must be provided");
//            }

//            int metadataLength = InputFile.Data[0];
//            byte[] metadataBytes = new byte[metadataLength];
//            Array.Copy(InputFile.Data, 1, metadataBytes, 0, metadataLength);

//            FileMetadataModel model = FileMetadataModel.FromByteArray(metadataBytes);

//            Metadata = model;
//        }

//        public static byte[] ExtractKey(int metadataLength, int keyLength)
//        {
//            byte[] encKey = new byte[keyLength];
//            if (InputFile?.Data == null)
//            {
//                throw new ArgumentNullException(nameof(InputFile), "Input file data must be provided.");
//            }
//            Array.Copy(InputFile.Data, 1 + metadataLength, encKey, 0, keyLength);
//            return encKey;
//        }

//        public static byte[] ExtractData(int metadataLength, int keyLength)
//        {
//            if (InputFile?.Data == null)
//            {
//                throw new ArgumentNullException(nameof(InputFile), "Input file data must be provided.");
//            }
//            int dataLength = InputFile.Data.Length - 1 - metadataLength - keyLength;
//            byte[] data = new byte[dataLength];
//            Array.Copy(InputFile.Data, 1 + metadataLength + keyLength, data, 0, dataLength);
//            return data;
//        }

//        public static void StartDecryption()
//        {
//            if(InputFile!.Data == null || Metadata == null)
//            {
//                throw new NullReferenceException();
//            }
//            int metadataLength = InputFile.Data[0];
//            //int keyLength = Metadata.KeyLength;
//            int keyLength = 0;
//            byte[] key = ExtractKey(metadataLength, keyLength);
//            byte[] data = ExtractData(metadataLength, keyLength);

//            RsaKeyParameters? rsaPrivateKey = GetRSAprivateKey() as RsaKeyParameters;

//            if (rsaPrivateKey == null) throw new ArgumentNullException("Couldnt retrive RSA private key");

//            byte[] decryptedKey = RSAencryption.Decrypt(key, rsaPrivateKey);

//            if (decryptedKey == null)
//            {
//                throw new CryptographicException("RSA private key decryption failed.");
//            }
//            byte[] decryptedData = Decrypt(decryptedKey, data) ?? throw new CryptographicException("Decryption failed.");
//            CreateDownloadUrl(decryptedData);
//        }

//        private static AsymmetricKeyParameter GetRSAprivateKey()
//        {
//            if (InputPassword!.Data == null) throw new ArgumentNullException(nameof(InputPassword), "Encryption password must be provided.");
//            AsymmetricCipherKeyPair? rsaKeyPair = RSAencryption.ConvertByteArrayToKeyPair(InputPassword.Data);
//            return rsaKeyPair.Private;
//        }

//        public static void CreateDownloadUrl(byte[] file)
//        {
//            // Convert file bytes into a downloadable data URL
//            var base64 = Convert.ToBase64String(file);
//            var mimeType = "application/octet-stream"; // General-purpose binary data MIME type

//            FileDownloadUrl = $"data:{mimeType};base64,{base64}";
//        }

//        public static FileModel? InputPassword { get; set; } = null;

//        public static FileModel? InputFile { get; set; }

//        public static string FileDownloadUrl { get; set; } = string.Empty;

//        public static FileMetadataModel? Metadata { get; set; }

//        public static string downloadUrl = string.Empty;

//        public static string downloadFileName = string.Empty;

//    }
//}

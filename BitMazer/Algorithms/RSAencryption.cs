using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Crypto.Encodings;
using System.Text;
using Org.BouncyCastle.OpenSsl;

namespace BitMazer.Algorithms
{
    public static class RSAencryption
    {
        const int KEY_SIZE = 2058;
        
        public static byte[] Encrypt(byte[] data, RsaKeyParameters publicKey)
        {
            var engine = new Pkcs1Encoding(new RsaEngine());
            engine.Init(true, publicKey);

            return engine.ProcessBlock(data, 0, data.Length);
        }

        public static byte[] Decrypt(byte[] encryptedData, RsaKeyParameters privateKey)
        {
            byte[]? decryptedBytes = new byte[encryptedData.Length];
            try
            {
                var engine = new Pkcs1Encoding(new RsaEngine());
                engine.Init(false, privateKey);

                decryptedBytes = engine.ProcessBlock(encryptedData, 0, encryptedData.Length);

                if (decryptedBytes == null) throw new ArgumentException("Error during decryption");

            }
            catch (InvalidCipherTextException ex) { 
                Console.WriteLine("Couldnt decrypt: "+ex.Message);
            }  
            return decryptedBytes;
        }

        public static AsymmetricCipherKeyPair GenerateRsaKeyPair()
        {
            var keyGenerationParameters = new KeyGenerationParameters(new SecureRandom(), KEY_SIZE);
            var keyPairGenerator = new RsaKeyPairGenerator();
            keyPairGenerator.Init(keyGenerationParameters);
            var keyPair = keyPairGenerator.GenerateKeyPair();

            if (keyPair == null)
            {
                throw new InvalidCastException("Couldn't generate RSA key pair.");
            }

            return keyPair;
        }

        public static byte[] ConvertKeyPairToByteArray(AsymmetricCipherKeyPair key)
        {
            using var stringWriter = new StringWriter();
            var pemWriter = new PemWriter(stringWriter);
            pemWriter.WriteObject(key);
            pemWriter.Writer.Flush();
            return Encoding.UTF8.GetBytes(stringWriter.ToString());
        }

        public static AsymmetricCipherKeyPair ConvertByteArrayToKeyPair(byte[] keyBytes)
        {
            using (var reader = new StringReader(System.Text.Encoding.UTF8.GetString(keyBytes)))
            {
                try
                {
                    var pemReader = new PemReader(reader);
                    var keyPair = pemReader.ReadObject() as AsymmetricCipherKeyPair;

                    if (keyPair == null)
                    {
                        throw new InvalidCastException("The byte array does not contain a valid key pair.");
                    }

                    return keyPair;
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Error parsing key pair: {e.Message}");
                    throw;
                }
            }
        }
    }
}

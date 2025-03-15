using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Microsoft.AspNetCore.Components.Forms;

namespace BitMazer.Algorithms
{
    public class ChaCha20encryption
    {
        // ChaCha20 requires a 12-byte iv and a 32-byte key
        const int IV_SIZE = 8; 
        const int KEY_SIZE = 32;

        public static byte[] Decrypt(byte[] key, byte[] cipherdata)
        {
            //extract the iv from the encrypted data
            byte[] iv = new byte[IV_SIZE];
            Array.Copy(cipherdata, 0, iv, 0, IV_SIZE);

            ChaChaEngine engine = new ChaChaEngine();
            ParametersWithIV parameters = new ParametersWithIV(new KeyParameter(key), iv);

            engine.Init(false, parameters);

            byte[] plaindata = new byte[cipherdata.Length - IV_SIZE];
            engine.ProcessBytes(cipherdata, IV_SIZE, cipherdata.Length - IV_SIZE, plaindata, 0);

            return plaindata;
        }
        
        public static (byte[], byte[]) Encrypt(byte[] file)
        {
            byte[] key = GenerateRandomKey();
            byte[] iv = GenerateRandomIV();

            ChaChaEngine engine = new ChaChaEngine();
            ParametersWithIV parameters = new ParametersWithIV(new KeyParameter(key), iv);

            engine.Init(true, parameters);

            byte[] cipherdata = new byte[file.Length];
            engine.ProcessBytes(file, 0, file.Length, cipherdata, 0);

            //append the iv vector
            byte[] cipherdataWithIV = iv.Concat(cipherdata).ToArray();

            return (cipherdataWithIV, key);
        }

        public static byte[] GenerateRandomIV()
        {
            byte[] iv = new byte[IV_SIZE]; 
            SecureRandom random = new SecureRandom();
            random.NextBytes(iv);
            return iv;
        }

        public static byte[] GenerateRandomKey()
        {
            byte[] keyBytes = new byte[KEY_SIZE]; 
            SecureRandom random = new SecureRandom();
            random.NextBytes(keyBytes);

            return keyBytes;
        }

    }
}

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Crypto;
using System.Security.Cryptography;

namespace BitMazer.Algorithms
{
    public class AESEncryption
    {
        // AES0 requires a 12-byte iv and a 32-byte key
        const int IV_SIZE = 12;
        const int KEY_SIZE = 32;
        const int TAG_SIZE = 16;

        public static byte[] Decrypt(byte[] key, byte[] cipherdataWithIV)
        {
            if (cipherdataWithIV.Length < IV_SIZE + TAG_SIZE)
            {
                throw new ArgumentException("Ciphertext is too short.");
            }

            // Extract the IV (nonce)
            byte[] iv = cipherdataWithIV.Take(IV_SIZE).ToArray();

            // Extract the actual encrypted data (ciphertext + tag)
            byte[] cipherdata = cipherdataWithIV.Skip(IV_SIZE).ToArray();

            GcmBlockCipher cipher = new GcmBlockCipher(new AesEngine());
            AeadParameters parameters = new AeadParameters(new KeyParameter(key), TAG_SIZE * 8, iv);

            cipher.Init(false, parameters); // false = decryption mode

            // Allocate space for decrypted data
            byte[] plaintext = new byte[cipher.GetOutputSize(cipherdata.Length)];

            try
            {
                int len = cipher.ProcessBytes(cipherdata, 0, cipherdata.Length, plaintext, 0);
                cipher.DoFinal(plaintext, len); // Verifies authentication tag

                return plaintext;
            }
            catch (InvalidCipherTextException)
            {
                throw new CryptographicException("Decryption failed. Authentication tag is invalid.");
            }
        }

        public static (byte[], byte[]) Encrypt(byte[] file)
        {
            byte[] key = GenerateRandomKey();
            byte[] iv = GenerateRandomIV();

            GcmBlockCipher cipher = new GcmBlockCipher(new AesEngine());
            AeadParameters parameters = new AeadParameters(new KeyParameter(key), TAG_SIZE * 8, iv);

            cipher.Init(true, parameters);

            // Allocate space for encrypted data + authentication tag
            byte[] cipherdata = new byte[cipher.GetOutputSize(file.Length)];

            int len = cipher.ProcessBytes(file, 0, file.Length, cipherdata, 0);
            cipher.DoFinal(cipherdata, len); // Finalize encryption and add tag

            // Append IV to the ciphertext (IV is needed for decryption)
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

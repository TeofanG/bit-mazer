using BitMazer.Enums;

namespace BitMazer.Constants
{
    public static class AlgorithmsOptions
    {
        public static readonly Dictionary<EncryptionAlgorithm, string> DisplayNames = new()
        {
            { EncryptionAlgorithm.AES_GCM, "AES-GCM" },
            { EncryptionAlgorithm.XChaCha20_Poly1305, "XChaCha20-Poly1305" },
            { EncryptionAlgorithm.Rabbit, "Rabbit" },
            { EncryptionAlgorithm.Twofish, "Twofish" }
        };

        public static readonly Dictionary<EncryptionAlgorithm, int[]> KeySizes = new()
        {
            { EncryptionAlgorithm.AES_GCM, new[] { 128, 256 } },
            { EncryptionAlgorithm.XChaCha20_Poly1305, new[] { 256 } },
            { EncryptionAlgorithm.Rabbit, new[] { 128 } },
            { EncryptionAlgorithm.Twofish, new[] { 128, 192, 256 } }
        };

        public static readonly List<int> RSAKeySizes = new()
        {
            1024, 2048, 4096
        };
    }
}

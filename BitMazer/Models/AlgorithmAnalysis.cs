using ApexCharts;
using BitMazer.Enums;

namespace BitMazer.Models
{
    public class AlgorithmAnalysis
    {
        public static float CalculateShannonEntropy(byte[] data)
        {
            if (data == null || data.Length == 0) return 0.0F;

            int[] frequencies = new int[256];
            foreach (byte b in data)
                frequencies[b]++;

            int len = data.Length;
            float entropy = 0.0F;

            foreach (int freq in frequencies)
            {
                if (freq > 0)
                {
                    float p = freq / len;
                    entropy -= p * MathF.Log(p, 2);
                }
            }

            return entropy;
        }
        public static double CalculateStandardDeviation(byte[] data)
        {
            int[] freq = new int[256];
            foreach (byte b in data)
            {
                freq[b]++;
            }

            double total = data.Length;
            double mean = 0;

            for (int i = 0; i < 256; i++)
            {
                mean += i * freq[i];
            }
            mean /= total;

            double variance = 0;
            for (int i = 0; i < 256; i++)
            {
                variance += freq[i] * Math.Pow(i - mean, 2);
            }
            variance /= total;

            return Math.Sqrt(variance);
        }
        public static double CalculateChiSquared(byte[] data)
        {
            if (data == null || data.Length == 0) return (0.0);

            int[] frequencies = new int[256];
            foreach (byte b in data)
                frequencies[b]++;

            double expectedFrequency = data.Length / 256.0;
            double chiSquared = 0.0;

            foreach (int observed in frequencies)
            {
                double diff = observed - expectedFrequency;
                chiSquared += (diff * diff) / expectedFrequency;
            }

            return chiSquared;
        }

        public EncryptionAlgorithm Algorithm { get; set; }
        public List<HistogramDataModel> HistogramData { get; set; } = [];
        public List<HistogramDataModel> FullHistogramData { get; set; } = [];

        public ApexChartOptions<HistogramDataModel> HistogramOptions { get; set; } = new();

        private double _memoryUsageBytes;
        public double MemoryUsageBytes
        {
            get { return _memoryUsageBytes; }
            set { _memoryUsageBytes = value; }
        }
        public float EncryptionTimeMs { get; set; }
        public double ChiSquareValue { get; set; }

        private float _entropy;
        public float Entropy
        {
            get { return MathF.Round(_entropy, 6); }
            set { _entropy = value; }
        }

        private double _stdDev;
        public double StdDev
        {
            get { return Math.Round(_stdDev, 2); }
            set { _stdDev = value; }
        }
    }
}

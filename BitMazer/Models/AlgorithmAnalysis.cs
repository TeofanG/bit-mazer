using ApexCharts;
using BitMazer.Enums;

namespace BitMazer.Models
{
    public class AlgorithmAnalysis
    {
        public const long VeryLowMemoryThreshold = 1;
        public const long LowMemoryThreshold = 10;
        public const long MediumMemoryThreshold = 50;

        public EncryptionAlgorithm Algorithm { get; set; }
        public List<HistogramDataModel> HistogramData { get; set; } = new();
        public ApexChartOptions<HistogramDataModel> HistogramOptions { get; set; } = new();

        private double _memoryUsageMB;

        public double MemoryUsageMB
        {
            get { return Math.Round(_memoryUsageMB, 2); }
            set { _memoryUsageMB = value; }
        }
        public string MemoryUsageLevel
        {
            get
            {
                if (MemoryUsageMB >= MediumMemoryThreshold)
                    return wwwroot.MemoryUsageLevel.High.ToString();
                else if (MemoryUsageMB >= LowMemoryThreshold)
                    return wwwroot.MemoryUsageLevel.Medium.ToString();
                else if (MemoryUsageMB >= VeryLowMemoryThreshold)
                    return wwwroot.MemoryUsageLevel.Low.ToString();
                else
                    return wwwroot.MemoryUsageLevel.VeryLow.ToString();
            }
        }
        public int EncryptionTimeMs { get; set; }

        private double _entropy;
        public double Entropy
        {
            get { return Math.Round(_entropy, 2); }
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

using ApexCharts;
using BitMazer.Enums;

namespace BitMazer.Models
{
    public class AlgorithmAnalysis
    {
        public const long VeryLowMemoryThreshold = 1 * 1024 * 1024;   // 1 MB
        public const long LowMemoryThreshold = 10 * 1024 * 1024;      // 10 MB
        public const long MediumMemoryThreshold = 50 * 1024 * 1024;   // 50 MB

        public EncryptionAlgorithm Algorithm { get; set; }
        public List<HistogramDataModel> HistogramData { get; set; } = new();
        public ApexChartOptions<HistogramDataModel> HistogramOptions { get; set; } = new();
        public long MemoryUsageBytes { get; set; }
        public string MemoryUsageLevel
        {
            get
            {
                if (MemoryUsageBytes >= MediumMemoryThreshold)
                    return wwwroot.MemoryUsageLevel.High.ToString();
                else if (MemoryUsageBytes >= LowMemoryThreshold)
                    return wwwroot.MemoryUsageLevel.Medium.ToString();
                else if (MemoryUsageBytes >= VeryLowMemoryThreshold)
                    return wwwroot.MemoryUsageLevel.Low.ToString();
                else
                    return wwwroot.MemoryUsageLevel.VeryLow.ToString();
            }
        }
        public int EncryptionTimeMs { get; set; }
        public double Entropy { get; set; }
        public double StdDev { get; set; }
    }
}

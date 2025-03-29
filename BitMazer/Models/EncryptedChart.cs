using ApexCharts;

namespace BitMazer.Models
{
    public class EncryptedChart
    {
        public EncryptionAlgorithm Algorithm { get; set; }
        public List<ByteFrequency> ChartData { get; set; } = new();
        public ApexChartOptions<ByteFrequency> ChartOptions { get; set; } = new();

        public double Entropy { get; set; }

        public double StdDev { get; set; }

    }
}

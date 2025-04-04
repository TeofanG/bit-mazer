using ApexCharts;

namespace BitMazer.Models
{
    public class HistogramModel
    {
        public EncryptionAlgorithm Algorithm { get; set; }
        public List<HistogramDataModel> ChartData { get; set; } = new();
        public ApexChartOptions<HistogramDataModel> ChartOptions { get; set; } = new();

        public double Entropy { get; set; }
        public double StdDev { get; set; }

    }
}

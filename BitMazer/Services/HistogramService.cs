using ApexCharts;

namespace BitMazer.Services
{
    public static class HistogramService
    {
        // Class used for ApexCharts plotting
        public class ByteFrequency
        {
            public string Category { get; set; } = ""; // X-axis label
            public int originalCount { get; set; }         // First data series
            public int encCount { get; set; }           // Second data series
        }


        /// <summary>
        /// Calculates byte frequency from a byte array.
        /// </summary>
        public static int[] CalculateByteFrequencies(byte[] data)
        {
            int[] frequencies = new int[256];
            foreach (byte b in data)
                frequencies[b]++;
            return frequencies;
        }

        /// <summary>
        /// Converts raw byte frequency to chart-ready data for ApexCharts.
        /// </summary>
        //public static List<ByteFrequency> ToChartData(int[] byteFrequencies)
        //{
        //    return Enumerable.Range(0, 256)
        //        .Select(i => new ByteFrequency
        //        {
        //            ByteLabel = i.ToString(),
        //            Count = byteFrequencies[i]
        //        })
        //        .ToList();
        //}
    }

}

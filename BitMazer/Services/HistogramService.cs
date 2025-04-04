using ApexCharts;
using BitMazer.Models;

namespace BitMazer.Services
{
    public static class HistogramService
    {
        public static ApexChartOptions<HistogramDataModel> GetChartOptions()
        {
            return new ApexChartOptions<HistogramDataModel>()
            {
                Chart = new Chart
                {
                    Type = ChartType.Bar,
                    Toolbar = new Toolbar { Show = true },
                    Zoom = new Zoom { Enabled = true }
                },
                Xaxis = new XAxis
                {
                    TickAmount = 32,
                    Title = new AxisTitle
                    {
                        Text = "Byte",
                        OffsetY = -30,
                        Style = new AxisTitleStyle { FontSize = "14px" }
                    },
                    Labels = new XAxisLabels
                    {
                        Rotate = -90,
                        Show = true,
                        Style = new AxisLabelStyle { FontSize = "12px" }
                    }
                },
                Yaxis = new List<YAxis>
        {
            new YAxis
            {
                Title = new AxisTitle
                {
                    Text = "Occurences",
                    Style = new AxisTitleStyle { FontSize = "14px" }
                }
            }
        },
            };
        }
        public static List<HistogramDataModel> GetChartData(byte[] bytes)
        {
            List<HistogramDataModel> data = [];
            int[] frequencies = new int[256];
            foreach (byte b in bytes)
                frequencies[b]++;

            data = Enumerable.Range(0, 256)
                .Select(i => new HistogramDataModel
                {
                    Byte = $"{i}",
                    Occurences = frequencies[i],
                }).ToList();
            return data;
        }

    }
}

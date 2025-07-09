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
                    Animations = new Animations { Enabled = true },
                    Toolbar = new Toolbar { Show = true },
                    Zoom = new Zoom { Enabled = true },
                    Width = "100%",
                    Height = "100%"
                },
                Responsive = new List<Responsive<HistogramDataModel>>
                {
                    new Responsive<HistogramDataModel>
                    {
                        Breakpoint = 768,
                        Options = new ApexChartOptions<HistogramDataModel>
                        {
                            PlotOptions = new PlotOptions
                            {
                                Bar = new PlotOptionsBar
                                {
                                    Horizontal = false,
                                    ColumnWidth = "70%"
                                }
                            }
                        }
                    }
                },
                Title = new Title
                {
                    Style = new TitleStyle
                    {
                        FontSize = "18px",
                        FontWeight = "bold"
                    }
                },
                Xaxis = new XAxis
                {
                    TickAmount = 32,
                    Title = new AxisTitle
                    {
                        Text = "Byte Value",
                        OffsetY = -30,
                        Style = new AxisTitleStyle
                        {
                            FontSize = "14px",
                            FontWeight = "normal"
                        }
                    },
                    Labels = new XAxisLabels
                    {
                        Rotate = -90,
                        Show = true,
                        Style = new AxisLabelStyle
                        {
                            FontSize = "12px",
                            FontWeight = "normal"
                        }
                    }
                },
                Yaxis = new List<YAxis>
                {
                    new YAxis
                    {
                        Title = new AxisTitle
                        {
                            Text = "Occurences",
                            OffsetX = -5,
                            Style = new AxisTitleStyle {
                                FontSize = "14px",
                                FontWeight = "normal"
                            }
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

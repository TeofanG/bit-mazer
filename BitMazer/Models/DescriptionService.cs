namespace BitMazer.Models
{
    public class DescriptionService
    {

        public DescriptionService()
        {
            descriptions = LoadDescriptions(filePath);
        }

        public string GetDescription(int key)
        {
            return descriptions.TryGetValue(key, out var description)
                ? description
                : "Description not found.";
        }

        private Dictionary<int, string> LoadDescriptions(string filePath)
        {
            var descriptions = new Dictionary<int, string>();

            if (File.Exists(filePath))
            {
                var lines = File.ReadAllLines(filePath);
                foreach (var line in lines)
                {
                    // Find the position of the colon
                    var colonIndex = line.IndexOf(':');

                    // Extract the number before the colon as the key
                    var key = int.Parse(line.Substring(0, colonIndex).Trim());

                    // Extract the description after the colon as the value
                    var description = line.Substring(colonIndex + 1).Trim();

                    descriptions[key] = description;
                }
            }
            return descriptions;
        }

        private readonly Dictionary<int, string> descriptions;

        private const string filePath = "wwwroot/resources/algorithmsInfo.txt";
    }
}

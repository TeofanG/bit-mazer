window.extractMetadataFromFile = async function () {
    const file = document.getElementById("dec-file-upload").files[0];

    try {
        const fileText = await file.text(); // Read file as plain text
        const json = JSON.parse(fileText);  // Parse it

        if (!json.metadata) {
            throw new Error("No metadata found in the JSON file.");
        }

        console.log("✅ Extracted metadata:", json.metadata);
        return JSON.stringify(json.metadata);
    } catch (err) {
        console.log("Metadata extraction failed:", err);
        throw err;
    }
}
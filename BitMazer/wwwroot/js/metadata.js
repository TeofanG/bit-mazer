window.extractMetadataFromFile = async function () {
    const file = document.getElementById("dec-file-upload").files[0];

    const fileBuf = await file.arrayBuffer();
    try {
        // Read the first 4 bytes to determine the metadata size (Uint32 format)
        const metadataSizeBytes = new Uint8Array(fileBuf.slice(0, 4));
        const metadataSize = new DataView(metadataSizeBytes.buffer).getUint32(0, true); // Little-endian

        // Extract metadata
        const metadataStart = 4;
        const metadataEnd = metadataStart + metadataSize;
        const metadataBuf = fileBuf.slice(metadataStart, metadataEnd);
        const metadataJson = new TextDecoder().decode(metadataBuf);
        console.log("Metadata extracted successfully:", metadataJson);
        return metadataJson;
    } catch (err) {
        console.log("Metadata extraction failed:", err);
        throw err;
    }
}

window.createMetadata = function (file, encryptionAlg) {
    if (!file) {
        console.log("Couldn't generate metadata, null file provided.")
        return null;
    }
    const metadata = {
        fileName: file.name || "unknown",
        fileType: file.type || "unknown",
        fileSize: file.size || "?",
        encAlg: encryptionAlg || "unknown"
    };
    const metadataJson = JSON.stringify(metadata);
    const metadataBytes = new TextEncoder().encode(metadataJson);

    return metadataBytes;
}
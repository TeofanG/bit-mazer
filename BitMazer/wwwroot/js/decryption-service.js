const keyLengthAES = 256;
const keyLengthChaCha = 256;

window.calcMetadataEnd = function (fileBuf) {
    //Extract the first 4 bytes, which store metadata length
    const metadataSizeBytes = new Uint8Array(fileBuf.slice(0, 4));
    const metadataSize = new DataView(metadataSizeBytes.buffer).getUint32(0, true);

    //Define metadata start and end positions
    const metadataStartOffset = 4;
    const metadataEndOffSet = metadataStartOffset + metadataSize;

    return metadataEndOffSet;
}

window.startDecryption = async function (encAlg, fileOriginalName) {
    try {
        const file = document.getElementById("dec-file-upload").files[0];

        // Step 1: Get the file and read it as an ArrayBuffer
        const fileBuf = await file.arrayBuffer();


        let ivLength;
        let keyLength;

        switch (encAlg) {
            case "AES_GCM":
                ivLength = ivLengthAES;
                keyLength = keyLengthAES;
                break;
            case "ChaCha20":
                ivLength = ivLengthChaCha;
                keyLength = keyLengthChaCha;
                break;
            default:
                throw new Error("Unknown algorithm, couldn't set iv and key lengths. (" + encAlg + ").");
                break;
        }  


        const metadataEnd = calcMetadataEnd(fileBuf);

        // Step 4: Extract IV
        const ivStart = metadataEnd;
        const ivEnd = ivStart + ivLength;
        const iv = fileBuf.slice(ivStart, ivEnd);

        // Step 5: Extract the encrypted key
        const encryptedKeyStartOffset = ivEnd;
        const encryptedKeyEndOffset = encryptedKeyStartOffset + keyLength;
        const encryptedKey = fileBuf.slice(encryptedKeyStartOffset, encryptedKeyEndOffset);

        // Step 6: Extract the encrypted Data (Remaining bytes)
        const encryptedDataStartOffset = encryptedKeyEndOffset;
        const encryptedData = fileBuf.slice(encryptedDataStartOffset);

        // Step 7: Decrypt key with the user-provided private RSA Key
        const rsaPrivateKeyRaw = document.getElementById("dec-key-upload").files[0];

        const rsaPrivateKey = await importRSAprivateKey(rsaPrivateKeyRaw);
        const decryptedKeyRaw = await decryptRSA(rsaPrivateKey, encryptedKey);
        if (!decryptedKeyRaw) {
            console.error("Failed to decrypt AES key.");
            return;
        }

        let decryptedData;
        let decryptionKey;
        switch (encAlg) {
            case "AES_GCM":
                decryptionKey = await aes.importKey(decryptedKeyRaw);
                decryptedData = await aes.decrypt(decryptionKey, iv, encryptedData);
                break;
            case "ChaCha20":
                decryptionKey = new Uint8Array(decryptedKeyRaw);
                encryptedData = new Uint8Array(encryptedData);
                iv = new Uint8Array(iv);

                decryptedData = chacha.decryptFile(encryptedData, iv, decryptionKey);
                break;
            default:
                throw new Error("Unknown algorithm provided for decryption (" + encAlg + ").");
                break;
        }  

        // Step 10: Download the decrypted file
        createDownloadButton(decryptedData, fileOriginalName);

        return "Success"; 
    } catch (err) {
        return `Error: ${err.message}`;

    }
}

window.initDecryption = function () {
    try {
        const encFile = document.getElementById("dec-file-upload").files[0];
        const encFileBuf = encFile.arrayBuffer();
        const metadata = extractMetadata(encFileBuf);
        const metadataJSON = JSON.parse(metadata);

        //displayMetaInfo(metadata);

        if (!meta)
            switch (metadataJSON.encAlg) {
                case "AES-256":
                    decryptAES(encFileBuf);
                    break;
                default:
                    console.log("Unknown algorithm used.");
                    break;
            }
    } catch (err) {
        console.error("Metadata extraction failed:", err);
    }

}
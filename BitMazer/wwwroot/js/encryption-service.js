const ivLengthAES = 16;

window.startEncryption = async function (selectedEncAlg, isCustomKeyEnabled) {
    try {
        // Step 1: Get file and convert it to ArrayBuffer
        const file = document.getElementById("enc-file-upload").files[0];
        const fileBuffer = await file.arrayBuffer();

        // Step 2: Create metadata
        const metadataBytes = createMetadata(file, selectedEncAlg);
        const metadataSize = metadataBytes.length; 
        const metadataSizeArray = new Uint32Array([metadataSize]); // Convert metadata size to Uint32Array
        const metadataSizeInBytes = new Uint8Array(metadataSizeArray.buffer); // Extract buffer as Uint8Array


        // Step 3: Encrypt the file data according to the selected algorithm 
        let encryptedData;
        let ivLength;
        let iv;
        let encKey;

        switch (selectedEncAlg) {
            case "AES_GCM":
                let aesKeyLength = 256;
                encKey = await aes.getKey("AES-GCM", aesKeyLength);
                if (!encKey) throw new Error("Failed to generate AES key.");

                ivLength = ivLengthAES;
                iv = window.crypto.getRandomValues(new Uint8Array(ivLength));
                encryptedData = await aes.encrypt(fileBuffer, iv, encKey);
                encKey = await crypto.subtle.exportKey("raw", encKey);
                break;
            case "ChaCha20":
                ivLength = CHACHA_IV_SIZE;
                iv = nacl.randomBytes(CHACHA_IV_SIZE);
                encKey = chacha.generateKey();

                encryptedData = chacha.encryptFile(new Uint8Array(fileBuffer), iv, encKey);
                break;
            default:
                console.error("Unknown algorithm provided for encryption (" + selectedEncAlg + ").");
                break;
        }  
        //????????????????????????????????????????????????????????????????
        // Step 4: Encrypt the encryption key with RSA
        const rsaKey = await getRSAkey(isCustomKeyEnabled);

        if (!rsaKey) {
            console.error("Error in obtaining the RSA key.");
        }

        //if a key pair is provided by the user use it, else generate another one
        let publicRSAKey = isCustomKeyEnabled ? rsaKey : rsaKey.publicKey;

        let encryptedKey = await encryptRSA(publicRSAKey, encKey); 
        if (!encryptedKey)
            console.error("RSA encryption of the encryption key failed. Make sure that you provided a valid public RSA key.");

        // Step 5: Combine all data to the final file (metadata length, metadata, IV, encrypted key, and encrypted data)
        const combinedBuffer = new Uint8Array(
            metadataSizeInBytes.length + metadataBytes.byteLength + ivLength + encryptedKey.byteLength + encryptedData.byteLength
        );
        combinedBuffer.set(metadataSizeInBytes, 0);
        combinedBuffer.set(metadataBytes, metadataSizeInBytes.length);
        combinedBuffer.set(iv, metadataSizeInBytes.length + metadataBytes.length);
        combinedBuffer.set(new Uint8Array(encryptedKey), metadataSizeInBytes.length + metadataBytes.length + ivLength);
        combinedBuffer.set(new Uint8Array(encryptedData), metadataSizeInBytes.length + metadataBytes.length + ivLength + encryptedKey.byteLength);

        // Step 6: Create button for the encrypted file download
        createDownloadButton(combinedBuffer, file.name.split('.').slice(0, -1).join('.') + ".enc");

        // Step 6: Create button for the RSA keys download, if the case
        if (isCustomKeyEnabled == false) {
            const exportedKeys = await exportRSAkeysToFiles(rsaKey);;
            const exportedRSApublickey = exportedKeys.publicKeyUint8Array;
            const exportedRSAprivatekey = exportedKeys.privateKeyUint8Array;
            createDownloadButton(exportedRSApublickey, "RSApublic.key");
            createDownloadButton(exportedRSAprivatekey, "RSAprivate.key");
        }
        return "Success"; 
    } catch (err) {
        return `Error: ${err}`;
    }
}

window.createDownloadButton = async function (fileData, fileName) {
    if (!(fileData instanceof Uint8Array)) {
        fileData = new Uint8Array(fileData);
    }

    let buttonId;
    if (fileName == "RSApublic.key") {
        buttonId = "download-btn-public-key";
    } else if (fileName == "RSAprivate.key") {
        buttonId = "download-btn-private-key";
    }
    else {
        buttonId = "download-btn-file";
    }
    const blob = new Blob([fileData], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    // Check if a button already exists to avoid duplicates
    let existingButton = document.getElementById(buttonId);
    if (existingButton) {
        console.warn(`Button for ${fileName} already exists.`);
        return;
    }

    // Create a Bootstrap-styled button
    const downloadContainer = document.getElementById("download-container");

    const button = document.createElement("button");
    button.id = buttonId;

    const buttonLink = document.createElement("a");
    buttonLink.className = "btn btn-primary w-auto";
    buttonLink.innerHTML = `<i class="bi bi-download"></i> Download ${fileName}`;
    buttonLink.href = url;
    buttonLink.download = fileName; // This ensures the user downloads the file only when they click

    // Append the button to a Bootstrap container (if available)
    let container = document.querySelector(".card");
    if (!container) {
        container = document.createElement("div");
        container.className = "card p-4";
        document.body.appendChild(container);
    }

    button.appendChild(buttonLink);
    downloadContainer.appendChild(button);
    container.appendChild(downloadContainer);
};


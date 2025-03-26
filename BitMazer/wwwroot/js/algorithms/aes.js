/*
    Ensure that the input file, key and IV are in Uint8Array format
*/
window.aes = {
    getKey: async function (mode, length) {
        try {
            const key = await window.crypto.subtle.generateKey(
                {
                    name: mode,
                    length: length,
                },
                true, // if extractable
                ["encrypt", "decrypt"] // key usages
            );
            console.log("AES key generated successfully.");
            return key;
        } catch (err) {
            console.error("Error generating AES key:", err);
            throw new Error("Invalid file object.");
            return null;
        }
    },

    encrypt: async function (plainData, iv, encKey) {
        try {
            if (!encKey) {
                throw new Error("Key is not defined.");
            }
            const encryptedData = await window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                    tagLength: 128, // authentication tag length
                },
                encKey,
                plainData
            );
            console.log("Data encrypted successfully.");
            return encryptedData;
        } catch (err) {
            console.error("Data encryption failed:", err);
            throw err;
        }
    },

    decrypt: async function (decKey, iv, encryptedData) {
        try {
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                },
                decKey,
                encryptedData
            );
            console.log("Data decrypted succesfully.");
            return decryptedData;
        } catch (err) {
            console.error("Data decryption failed:", err);
        }
    },

    importKey: async function (aesRawKey) {
        try {
            const aesKey = await window.crypto.subtle.importKey(
                "raw", //can be "jwk" or "raw"
                aesRawKey,
                {   //this is the algorithm options
                    name: "AES-GCM",
                },
                false, //whether the key is extractable (i.e. can be used in exportKey)
                ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
            );
            console.log(aesKey);
            return aesKey;
        } catch (err) {
            console.error(err);
        }
    }
}

import { DomElements } from '../constants/domElements.js';

const {
    ENC_KEY_INPUT_FIELD
} = DomElements;

window.rsa = {
    generateKey: async function (mode, modulusLength, hashType) {
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: mode, //RSA-OAEP
                    modulusLength: modulusLength, // key size; can be 1024, --2048, or 4096
                    publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // Standard public exponent
                    hash: { name: hashType } // secure hash algorithm; can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
                },
                true, // whether the key is exportable
                ["encrypt", "decrypt"] // usages for the key pair
            );
            if (!keyPair) throw new Error("RSA key generation failed.");
            console.log("✅ RSA key pair generated successfully.");
            return keyPair;
        } catch (error) {
            console.error("❌ Failed to generate RSA key pair:", error.message);
            return `Error: ${error.message}`;
        }
    },

    encrypt: async function (encPublicKey, plainData) {
        try {
            if (!encPublicKey) {
                throw new Error("Key is not defined.");
            }

            const encryptedKey = await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP",
                    //label: Uint8Array([...]) //optional
                },
                encPublicKey,
                plainData
            );
            console.log("Data encrypted successfully.");
            return encryptedKey;
        } catch (err) {
            console.error("Error during encryption:", err);
            throw err;
        }
    },

    decrypt: async function (encPrivateKey, encryptedData) {
        try {
            const decryptedKey = await window.crypto.subtle.decrypt(
                {
                    name: "RSA-OAEP",
                },
                encPrivateKey,
                encryptedData
            );
            console.log("Data decrypted successfully.");
            return decryptedKey;
        } catch (err) {
            console.error("Error during decryption:", err);
        }
    },

    importPrivateKey: async function (file) {
        try {
            const fileContent = await file.arrayBuffer();
            const publicKeyUint8Array = new Uint8Array(fileContent);

            const RSApublicKey = await window.crypto.subtle.importKey(
                "pkcs8",
                publicKeyUint8Array,
                {
                    name: "RSA-OAEP",
                    hash: { name: "SHA-256" }
                },
                true,
                ["decrypt"]
            );

            if (!RSApublicKey) throw new Error("Invalid RSA private key file.");
            console.log("✅ RSA private key imported successfully.");
            return RSApublicKey;
        } catch (err) {
            console.error("❌ Failed to import RSA private key:", err.message);
            return `Error: ${err.message}`;  // 🔥 Return error instead of throwing
        }
    },

    importPublicKey: async function () {
        try {
            const fileInput = document.getElementById(ENC_KEY_INPUT_FIELD);
            if (!fileInput || fileInput.files.length === 0) {
                throw new Error("No RSA public key file selected.");
            }

            const file = fileInput.files[0];
            const fileContent = await file.arrayBuffer();
            const publicKeyUint8Array = new Uint8Array(fileContent);

            const RSApublicKey = await window.crypto.subtle.importKey(
                "spki",
                publicKeyUint8Array,
                {
                    name: "RSA-OAEP",
                    hash: { name: "SHA-256" }
                },
                true,
                ["encrypt"]
            );

            if (!RSApublicKey) throw new Error("Invalid RSA public key file.");
            console.log("✅ RSA public key imported successfully.");
            return RSApublicKey;
        } catch (err) {
            console.error("❌ Failed to import RSA public key:", err.message);
            return `Error: ${err.message}`;  // 🔥 Return error instead of throwing
        }
    },

    exportKeysToFiles: async function (RSAkeyPair) {
        try {
            const publicKeyArrayBuffer = await window.crypto.subtle.exportKey("spki", RSAkeyPair.publicKey);
            const publicKeyUint8Array = new Uint8Array(publicKeyArrayBuffer);

            const privateKeyArrayBuffer = await window.crypto.subtle.exportKey("pkcs8", RSAkeyPair.privateKey);
            const privateKeyUint8Array = new Uint8Array(privateKeyArrayBuffer);

            console.log("RSA key pair exported to file successfully.");
            //console.log("RSA Key:", keyPair);
            return { publicKeyUint8Array, privateKeyUint8Array };
        } catch (err) {
            console.error("Failure in exporting RSA key to file:", err);
        }
    },

    getKey: async function (isCustomKeyEnabled) {
        try {
            if (isCustomKeyEnabled) {
                console.log("🔹 Importing custom RSA public key...");
                const rsaPublicKey = await this.importPublicKey();
                if (!rsaPublicKey) throw new Error("Failed to import RSA public key.");
                return rsaPublicKey;
            } else {
                console.log("🔹 Generating new RSA key pair...");
                const rsaKeyPair = await this.generateKey("RSA-OAEP", 2048, "SHA-256");
                if (!rsaKeyPair) throw new Error("Failed to generate RSA key pair.");
                return rsaKeyPair;
            }
        } catch (err) {
            console.error("❌ Error in obtaining the RSA key:", err.message);
            return `Error: ${err.message}`;
        }
    }
}






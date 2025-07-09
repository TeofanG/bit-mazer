
export const rsa = {

    encrypt: async function (encPublicKey, plainData) {
        try {
            if (!encPublicKey) {
                throw new Error("Key is not defined.");
            }

            const encryptedKey = await crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP",
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
            const decryptedKey = await crypto.subtle.decrypt(
                {
                    name: "RSA-OAEP",
                },
                encPrivateKey,
                encryptedData
            );
            return decryptedKey;
        } catch (err) {
            throw err;
        }
    },

    generateKey: async function (mode, keySize, hashAlg) {
        try {
            const keyPair = await crypto.subtle.generateKey(
                {
                    name: mode, // RSA-OAEP
                    modulusLength: keySize, // 1024, 2048, or 4096
                    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                    hash: { name: hashAlg } // "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
                },
                true,
                ["encrypt", "decrypt"]
            );
            return keyPair;
        } catch (error) {
            throw err;
        }
    },

    getKey: async function (rsaKeySize, isCustomKeyEnabled, keyBuffer) {
        try {
            if (isCustomKeyEnabled) {
                const rsaPublicKey = await this.importPublicKey(keyBuffer);
                if (!rsaPublicKey) throw new Error("Failure to import RSA public key.");
                return rsaPublicKey;
            } else {
                const rsaKeyPair = await this.generateKey("RSA-OAEP", rsaKeySize, "SHA-256");
                if (!rsaKeyPair) throw new Error("Failed to generate RSA key pair.");
                return rsaKeyPair;
            }
        } catch (err) {
            throw err;
        }
    },

    importPrivateKey: async function (fileBuffer) {
        try {
            const key = await crypto.subtle.importKey(
                "pkcs8",
                fileBuffer,
                {
                    name: "RSA-OAEP",
                    hash: { name: "SHA-256" }
                },
                true,
                ["decrypt"]
            );
            if (!key) throw new Error("Failure to import RSA private key.");
            return key;
        } catch (err) {
            throw err;
        }
    },

    importPublicKey: async function (fileBuffer) {
        try {
            const key = await crypto.subtle.importKey(
                "spki",
                fileBuffer,
                {
                    name: "RSA-OAEP",
                    hash: { name: "SHA-256" }
                },
                true,
                ["encrypt"]
            );
            return key;
        } catch (err) {
            throw err;  
        }
    },

    exportKeyPairToByteArr: async function (RSAkeyPair) {
        try {
            const publicKeyArrayBuffer = await crypto.subtle.exportKey("spki", RSAkeyPair.publicKey);
            const publicKeyUint8Array = new Uint8Array(publicKeyArrayBuffer);

            const privateKeyArrayBuffer = await crypto.subtle.exportKey("pkcs8", RSAkeyPair.privateKey);
            const privateKeyUint8Array = new Uint8Array(privateKeyArrayBuffer);

            return { publicKeyUint8Array, privateKeyUint8Array };
        } catch (err) {
            throw err;  
        }
    },

}






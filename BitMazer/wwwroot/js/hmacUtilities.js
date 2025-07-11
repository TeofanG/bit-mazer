export const hmac = {

    sign: async function (keyBytes, message) {
        try {
            const signature = await crypto.subtle.sign(
                {
                    name: "HMAC",
                },
                keyBytes,
                message
            );

            return signature;

        } catch (err) {
            throw err;
        }
    },

    verify: async function (keyBytes, signature, message) {
        try {
            const isValid = await crypto.subtle.verify(
                {
                    name: "HMAC",
                },
                keyBytes,
                signature,
                message
            );

            return isValid;

        } catch (err) {
            throw err;
        }
    },

    generateKey: async function () {
        try {
            const hmacKey = await crypto.subtle.generateKey(
                {
                    name: "HMAC",
                    hash: { name: "SHA-256" },
                },
                true,
                ["sign", "verify"]
            )

            return hmacKey;
        } catch (err) {
            throw err;
        }
    },

    importKey: async function (rawKey) {
        try {
            const hmacKey = await crypto.subtle.importKey(
                "raw",
                rawKey,
                {
                    name: "HMAC",
                    hash: { name: "SHA-256" },
                },
                false,
                ["sign", "verify"]
            );

            return hmacKey;

        } catch (err) {
            throw err;
        }
    },

    exportKey: async function (key) {
        try {
            const hmacKey = await crypto.subtle.exportKey(
                "raw",
                key
            );

            return hmacKey;

        } catch (err) {
            throw err;
        }
    },

};
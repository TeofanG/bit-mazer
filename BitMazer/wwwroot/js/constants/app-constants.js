const FileDownloadNames = {
    DEC_KEY_FILE: "decryptionRSA",
    ENC_KEY_FILE: "encryptionRSA",
    ENCRYPTED_FILE: ".enc.json",
};

const FileTypes = {
    APP_JSON: "application/json",
    APP_OCTET: "application/octet-stream"
};

const DomSelectors = {
    ENC_INPUT_FIELD: "enc-file-upload",
    DEC_INPUT_FIELD: "dec-file-upload",
    ENC_KEY_INPUT_FIELD: "key-file-upload",
    DEC_KEY_INPUT_FIELD: "dec-key-upload",
    DOWNLOAD_CONTAINER: "download-container"
};

const MIN_DURATION = 2000;

export { FileDownloadNames, FileTypes, DomSelectors, MIN_DURATION };

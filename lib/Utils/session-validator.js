"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCredsFile = validateCredsFile;
exports.validateAuthFolder = validateAuthFolder;
exports.cleanSessionFiles = cleanSessionFiles;
exports.nukeAuthFolder = nukeAuthFolder;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const REQUIRED_CREDS_FIELDS = [
    'noiseKey',
    'signedIdentityKey',
    'signedPreKey',
    'registrationId',
    'advSecretKey',
    'me',
];
/**
 * Validates the Baileys auth state credentials file.
 * Detects corrupted / incomplete sessions before connecting.
 */
function validateCredsFile(credsPath) {
    if (!fs_1.default.existsSync(credsPath)) {
        return { valid: false, reason: 'creds.json not found', shouldCleanup: false };
    }
    let creds;
    try {
        const raw = fs_1.default.readFileSync(credsPath, 'utf-8');
        creds = JSON.parse(raw);
    }
    catch {
        return { valid: false, reason: 'creds.json is not valid JSON', shouldCleanup: true };
    }
    for (const field of REQUIRED_CREDS_FIELDS) {
        if (!(field in creds) || creds[field] === null || creds[field] === undefined) {
            return {
                valid: false,
                reason: `Missing required creds field: ${field}`,
                shouldCleanup: true,
            };
        }
    }
    // Check for obviously corrupted noiseKey
    const noiseKey = creds.noiseKey;
    if (!noiseKey || !noiseKey.private || !noiseKey.public) {
        return { valid: false, reason: 'Corrupted noiseKey in creds.json', shouldCleanup: true };
    }
    return { valid: true };
}
/**
 * Validates an auth folder by checking all session files.
 * Returns true if the session appears healthy.
 */
function validateAuthFolder(authFolder) {
    if (!fs_1.default.existsSync(authFolder)) {
        return { valid: false, reason: 'Auth folder does not exist', shouldCleanup: false };
    }
    const credsPath = path_1.default.join(authFolder, 'creds.json');
    return validateCredsFile(credsPath);
}
/**
 * Cleans up an auth folder by removing all session files EXCEPT creds.json.
 * Use when session is corrupted but we want to preserve creds for re-registration.
 */
function cleanSessionFiles(authFolder, keepCreds = false) {
    if (!fs_1.default.existsSync(authFolder))
        return;
    const files = fs_1.default.readdirSync(authFolder);
    for (const file of files) {
        if (keepCreds && file === 'creds.json')
            continue;
        const filePath = path_1.default.join(authFolder, file);
        try {
            fs_1.default.unlinkSync(filePath);
        }
        catch {
            // ignore
        }
    }
}
/**
 * Fully nukes the auth folder and recreates it empty.
 */
function nukeAuthFolder(authFolder) {
    if (fs_1.default.existsSync(authFolder)) {
        fs_1.default.rmSync(authFolder, { recursive: true, force: true });
    }
    fs_1.default.mkdirSync(authFolder, { recursive: true });
}
//# sourceMappingURL=session-validator.js.map
import type { SessionValidationResult } from '../Types';
/**
 * Validates the Baileys auth state credentials file.
 * Detects corrupted / incomplete sessions before connecting.
 */
export declare function validateCredsFile(credsPath: string): SessionValidationResult;
/**
 * Validates an auth folder by checking all session files.
 * Returns true if the session appears healthy.
 */
export declare function validateAuthFolder(authFolder: string): SessionValidationResult;
/**
 * Cleans up an auth folder by removing all session files EXCEPT creds.json.
 * Use when session is corrupted but we want to preserve creds for re-registration.
 */
export declare function cleanSessionFiles(authFolder: string, keepCreds?: boolean): void;
/**
 * Fully nukes the auth folder and recreates it empty.
 */
export declare function nukeAuthFolder(authFolder: string): void;
//# sourceMappingURL=session-validator.d.ts.map
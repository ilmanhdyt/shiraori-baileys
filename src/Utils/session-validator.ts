import fs from 'fs'
import path from 'path'
import type { SessionValidationResult } from '../Types'

const REQUIRED_CREDS_FIELDS = [
  'noiseKey',
  'signedIdentityKey',
  'signedPreKey',
  'registrationId',
  'advSecretKey',
  'me',
]

/**
 * Validates the Baileys auth state credentials file.
 * Detects corrupted / incomplete sessions before connecting.
 */
export function validateCredsFile(credsPath: string): SessionValidationResult {
  if (!fs.existsSync(credsPath)) {
    return { valid: false, reason: 'creds.json not found', shouldCleanup: false }
  }

  let creds: Record<string, unknown>
  try {
    const raw = fs.readFileSync(credsPath, 'utf-8')
    creds = JSON.parse(raw)
  } catch {
    return { valid: false, reason: 'creds.json is not valid JSON', shouldCleanup: true }
  }

  for (const field of REQUIRED_CREDS_FIELDS) {
    if (!(field in creds) || creds[field] === null || creds[field] === undefined) {
      return {
        valid: false,
        reason: `Missing required creds field: ${field}`,
        shouldCleanup: true,
      }
    }
  }

  // Check for obviously corrupted noiseKey
  const noiseKey = creds.noiseKey as Record<string, unknown>
  if (!noiseKey || !noiseKey.private || !noiseKey.public) {
    return { valid: false, reason: 'Corrupted noiseKey in creds.json', shouldCleanup: true }
  }

  return { valid: true }
}

/**
 * Validates an auth folder by checking all session files.
 * Returns true if the session appears healthy.
 */
export function validateAuthFolder(authFolder: string): SessionValidationResult {
  if (!fs.existsSync(authFolder)) {
    return { valid: false, reason: 'Auth folder does not exist', shouldCleanup: false }
  }

  const credsPath = path.join(authFolder, 'creds.json')
  return validateCredsFile(credsPath)
}

/**
 * Cleans up an auth folder by removing all session files EXCEPT creds.json.
 * Use when session is corrupted but we want to preserve creds for re-registration.
 */
export function cleanSessionFiles(authFolder: string, keepCreds: boolean = false): void {
  if (!fs.existsSync(authFolder)) return

  const files = fs.readdirSync(authFolder)
  for (const file of files) {
    if (keepCreds && file === 'creds.json') continue
    const filePath = path.join(authFolder, file)
    try {
      fs.unlinkSync(filePath)
    } catch {
      // ignore
    }
  }
}

/**
 * Fully nukes the auth folder and recreates it empty.
 */
export function nukeAuthFolder(authFolder: string): void {
  if (fs.existsSync(authFolder)) {
    fs.rmSync(authFolder, { recursive: true, force: true })
  }
  fs.mkdirSync(authFolder, { recursive: true })
}

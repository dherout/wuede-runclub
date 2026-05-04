export interface VaultEnvelope {
  v: 1
  alg: 'AES-256-GCM'
  kdf: { name: 'PBKDF2-SHA256'; iter: number; salt_b64: string }
  iv_b64: string
  ct_b64: string
}

const PBKDF2_ITER = 600_000
const SALT_LEN = 16
const IV_LEN = 12

const enc = new TextEncoder()
const dec = new TextDecoder()

type Bytes = Uint8Array<ArrayBuffer>

function toB64(bytes: Bytes): string {
  const CHUNK = 0x8000
  let s = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(s)
}

function fromB64(s: string): Bytes {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function utf8(s: string): Bytes {
  const tmp = enc.encode(s)
  const out = new Uint8Array(tmp.length)
  out.set(tmp)
  return out
}

async function deriveKey(passphrase: string, salt: Bytes): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey('raw', utf8(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(plaintext: string, passphrase: string): Promise<VaultEnvelope> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN))
  const key = await deriveKey(passphrase, salt)
  const ctBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, utf8(plaintext))
  return {
    v: 1,
    alg: 'AES-256-GCM',
    kdf: { name: 'PBKDF2-SHA256', iter: PBKDF2_ITER, salt_b64: toB64(salt) },
    iv_b64: toB64(iv),
    ct_b64: toB64(new Uint8Array(ctBuf)),
  }
}

export async function decrypt(envelope: VaultEnvelope, passphrase: string): Promise<string> {
  if (envelope.v !== 1) throw new Error(`unsupported vault version: ${envelope.v}`)
  const salt = fromB64(envelope.kdf.salt_b64)
  const iv = fromB64(envelope.iv_b64)
  const ct = fromB64(envelope.ct_b64)
  const key = await deriveKey(passphrase, salt)
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return dec.decode(pt)
}

export async function ciphertextDigest(envelope: VaultEnvelope): Promise<string> {
  const ct = fromB64(envelope.ct_b64)
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', ct))
  return 'sha256:' + toB64(hash)
}

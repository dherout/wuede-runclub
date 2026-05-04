const enc = new TextEncoder()

export async function sha256Hex(input: string): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(input)))
  let hex = ''
  for (const b of hash) hex += b.toString(16).padStart(2, '0')
  return hex
}

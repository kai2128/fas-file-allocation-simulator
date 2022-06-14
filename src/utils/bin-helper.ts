export const isHex = (maybeHex: string) =>
  maybeHex.length !== 0 && maybeHex.length % 2 === 0 && !/[^a-fA-F0-9]/u.test(maybeHex)

export const fromHexString = (hexString: string): ArrayBuffer => {
  hexString = hexString.replace(/[\s\n\r]+/g, '')
  if (hexString == null || !isHex(hexString))
    throw new Error('Invalid hex string')
  return Uint8Array.from(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))).buffer
}

export const toHexString = (bytes: ArrayBuffer): string => {
  return new Uint8Array(bytes).reduce((str, byte) => str + byte.toString(16).toUpperCase().padStart(2, '0'), '')
}


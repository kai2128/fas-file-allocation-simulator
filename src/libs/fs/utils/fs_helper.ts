import parsePath from 'parse-filepath'

export function isValidPath(path: string): boolean {
  return path.startsWith('/root')
}

export function isDir(path: string) {
  return parsePath(path).ext === ''
}

export function isFile(path: string) {
  return parsePath(path).ext !== ''
}

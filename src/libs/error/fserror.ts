export enum ERRCODE {
  ENOENT = 'ENOENT',
  EBADF = 'EBADF',
  EINVAL = 'EINVAL',
  EPERM = 'EPERM',
  EPROTO = 'EPROTO',
  EEXIST = 'EEXIST',
  ENOTDIR = 'ENOTDIR',
  EMFILE = 'EMFILE',
  EACCES = 'EACCES',
  EISDIR = 'EISDIR',
  ENOTEMPTY = 'ENOTEMPTY',
  ENOSYS = 'ENOSYS',
  ERR_FS_EISDIR = 'ERR_FS_EISDIR',
  ESPACE = 'ESPACE',
}

export enum ERRSTR {
  PATH_STR = 'path must be a string or Buffer',
  FD = 'fd must be a file descriptor',
  MODE_INT = 'mode must be an int',
  CB = 'callback must be a function',
  UID = 'uid must be an unsigned int',
  GID = 'gid must be an unsigned int',
  LEN = 'len must be an integer',
  ATIME = 'atime must be an integer',
  MTIME = 'mtime must be an integer',
  PREFIX = 'filename prefix is required',
  BUFFER = 'buffer must be an instance of Buffer or StaticBuffer',
  OFFSET = 'offset must be an integer',
  LENGTH = 'length must be an integer',
  POSITION = 'position must be an integer',
  SIZE = 'disk size not enough',
  NOT_FOUND = 'file not found',
}

export class FSError extends Error {
  constructor(errorCode: ERRCODE, msg: ERRSTR | string = '', path?: string) {
    super(FSError.formatError(errorCode, msg, path))
    this.name = errorCode as any as string
  }

  static formatError(errorCode: ERRCODE, msg: string | ERRSTR = '', path?: string) {
    let pathFormatted = ''
    if (path)
      pathFormatted = ` '${path}'`

    switch (errorCode) {
      case ERRCODE.ENOENT:
        return `ENOENT: no such file, ${msg}${pathFormatted}`
      case ERRCODE.EBADF:
        return `EBADF: bad file descriptor, ${msg}${pathFormatted}`
      case ERRCODE.EINVAL:
        return `EINVAL: invalid argument, ${msg}${pathFormatted}`
      case ERRCODE.EPERM:
        return `EPERM: operation not permitted, ${msg}${pathFormatted}`
      case ERRCODE.EEXIST:
        return `EEXIST: file already exists, ${msg}${pathFormatted}`
      case ERRCODE.ENOSYS:
        return `ENOSYS: function not implemented, ${msg}${pathFormatted}`
      default:
        return `${errorCode}: error occurred, ${msg}${pathFormatted}`
    }
  }
}

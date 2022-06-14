export interface FSApi {
  fs_create(path: string, fileName: string): void
  fs_append(path: string, size: number): void
  fs_read(path: string): void
  fs_delete(path: string): void
}

export interface FSApi {
  fs_create(fileName: string, size: number): void
  fs_append(fileName: string, size: number): void
  fs_read(fileName: string): void
  fs_delete(fileName: string): void
}

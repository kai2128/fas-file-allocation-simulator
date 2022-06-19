import type { FSActions } from '~/libs/fs/types'

export const fatActions: FSActions = {
  create: {
    steps: [
      {
        index: 0,
        description: `
        Create a directory entry for file metadata (check if directory entry with same name already exists then allocate empty directory entry)
        `,
      },
      {
        index: 1,
        description: `
        Find first free cluster from FAT table, allocate the cluster and mark it as end of file in FAT table, update first allocated cluster in file directory entry.
        `,
      },
      {
        index: 2,
        description: `
        If file havent completely allocated, continue to look to free cluster from FAT table, allocate the cluster and mark it as end of file in FAT table, update previous FAT table value to current cluster number. Repeat this step until file completely allocated.
        `,
      },
    ],
    codes: [
      {
        index: 0,
        code: '-',
      },
    ],
  },
  read: {
    steps: [
      {
        index: 0,
        description: `
        Search for the directory entry with same name in the root directory.
        `,
      },
      {
        index: 1,
        description: `
        From the directory entry found, retrieve the first cluster number of the file.
        `,
      },
      {
        index: 2,
        description: `
        From FAT table, find all the clusters allocated to the file by using the first cluster number. (read FAT table next cluster value until EOF)
        `,
      },
      {
        index: 3,
        description: `
        The data of the files is readed in this cluster
        `
      }
    ]
  },
  delete: {
    steps: [
      {
        index: 0,
        description: `
        Search for the directory entry with same name in the root directory.
        `,
      },
      {
        index: 1,
        description: `
        From the directory entry found, retrieve the first cluster number of the file.
        `,
      },
      {
        index: 2,
        description: `
        From FAT table, find all the clusters allocated to the file by using the first cluster number. (read FAT table next cluster value until EOF)
        `,
      },
      {
        index: 3,
        description: `
        Mark all the clusters allocated to the file as free in FAT table.
        `,
      },
      {
        index: 4,
        description: `
        Mark the directory entry of the file as free in directory.
        `
      },
      codes: [],
    ],
  },
  append: {
    steps: [
      {
        index: 0,
        description: `
        Search for the file in the root directory.
        `
      },
      {
        index: 1,
        description: `
        Locate the last cluster of the 
        `
      }
    ]
  }
}

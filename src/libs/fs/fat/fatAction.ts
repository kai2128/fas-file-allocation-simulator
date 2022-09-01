import type { FSActions } from '~/libs/fs/types'

export const fatActions: FSActions = {
  create: {
    steps: [
      {
        index: 0,
        description: 'Check if directory entry with same name already exists then allocate empty directory entry',
      },
      {
        index: 1,
        description: `
        Create a directory entry to store file's metadata
        `,
      },
      {
        index: 2,
        description: `
        Find first free block from FAT table
        `,
      },
      {
        index: 3,
        description: `
        Allocate the block and set it as end of file (0xFFF) in FAT table, update the first allocated fat in file directory entry.
        `,
      },
      {
        index: 4,
        description: `
        If file have not completely allocated, continue to:
        `,
      },
      {
        index: 5,
        description: `
        - look to free block from FAT table, 
        `,
      },
      {
        index: 6,
        description: `
        - allocate the block and set it as end of file in FAT table
        `,
      },
      {
        index: 7,
        description: `
        - update previous FAT table value to current fat index. Repeat until all blocks are allocated.
        `,
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
        From the directory entry found, retrieve the first fat number of the file.
        `,
      },
      {
        index: 2,
        description: `
        From FAT table, find all the blocks allocated to the file by using the first fat number. Repeat until EOF.
        `,
      },
      {
        index: 3,
        description: `
        The data of the file is fully read.
        `,
      },
    ],
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
        From the directory entry found, retrieve the first fat number of the file.
        `,
      },
      {
        index: 2,
        description: `
        From FAT table, find all the blocks allocated to the file by using the first fat number. (read FAT table next block value until EOF)
        `,
      },
      {
        index: 3,
        description: `
        Mark all the blocks allocated to the file as free in FAT table.
        `,
      },
      {
        index: 4,
        description: `
        Mark the directory entry of the file as free in directory.
        `,
      },
    ],
  },
  append: {
    steps: [
      {
        index: 0,
        description: `
        Search for the file in the root directory.
        `,
      },
      {
        index: 1,
        description: `
        Locate the last block of the file
        `,
      },
      {
        index: 2,
        description: `
        Allocate new block and set it as end of file (0xFFF) in FAT table, update the last block of the file to current block number.
        `,
      },
      {
        index: 3,
        description: `
        If file have not completely allocated, continue to:
        `,
      },
      {
        index: 4,
        description: `
        - look to free block from FAT table, 
        `,
      },
      {
        index: 5,
        description: `
        - allocate the block and set it as end of file in FAT table
        `,
      },
      {
        index: 6,
        description: `
        - update previous FAT table value to current block number. Repeat until all blocks are allocated.
        `,
      },
      {
        index: 7,
        description: `
        File append completed
        `,
      },
    ],
  },
  write: {
    steps: [
      {
        index: 0,
        description: 'Delete original file and create new one',
      },
    ],
  },
}

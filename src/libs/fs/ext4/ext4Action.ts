import type { FSActions } from '../types'

export const ext4Action: FSActions = {
  create: {
    steps: [
      {
        index: 0,
        description: 'Check if file with same name exists',
      },
      {
        index: 1,
        description: 'Allocate free inode for the file',
      },
      {
        index: 2,
        description: `
        Search for free blocks from block bitmaps for allocation.
        `,
      },
      {
        index: 3,
        description: `
        For each contigous free blocks found, create an extent for 
        these block by recording its starting block and its length.
        `,
      },
      {
        index: 4,
        description: `
        Based on extents, set blocks as used in block bitmap.`,
      },
      {
        index: 5,
        description: `
        Add file to root directory.`,
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
        From the directory entry found, retrieve the inode number. From inode number, retrieve inode data.
        `,
      },
      {
        index: 2,
        description: `
        Mark all allocated block recorded in extents as free in the block bitmap.
        `,
      },
      {
        index: 3,
        description: `
        Mark inode as free and remove inode from directory.
        `,
      },
    ],
  },
  append: {
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
        Locate last allocated block of the file from extent data.
        `,
      },
      {
        index: 2,
        description: `
        Start searching for free block in last allocated block.
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
        From the directory entry found, retrieve the inode number.
        `,
      },
      {
        index: 2,
        description: `
        From inode number, retrieve inode data
        `,
      },
      {
        index: 3,
        description: `
        From inode data, extents stores all the block allocated to the file.
        `,
      },
    ],
  },
}

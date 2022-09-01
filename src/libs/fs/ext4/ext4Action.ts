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
        For each contiguous free blocks found, create an extent for 
        these blocks by recording its starting block and its length.
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
        Retrieve allocated blocks from all extents.`,
      },
      {
        index: 3,
        description: `
        Mark all allocated blocks recorded in extents as free in the block bitmap.
        `,
      },
      {
        index: 4,
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
        From the directory entry found, retrieve the inode number. From inode number, retrieve inode data.
        `,
      },
      {
        index: 2,
        description: `
        Allocated blocks are stored in extents. Retrieve allocated blocks from all extents.`,
      },
      {
        index: 3,
        description: `
        Locate last allocated block of the file from extent data.
        `,
      },
      {
        index: 4,
        description: `
        Start searching for free block from last allocated block. For each contiguous free blocks found, create an extent for these blocks by recording its starting block and its length.
        `,
      },
      {
        index: 5,
        description: `
        Merge all contiguous extents to one extents.
        `,
      },
      {
        index: 6,
        description: `
        Based on extents, set blocks as used in block bitmap.
        `,
      },
    ],
  },
  write: {
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
        From the directory entry found, retrieve the inode number. From inode number, retrieve inode data and allocated blocks.
        `,
      },
      {
        index: 2,
        description: `
        Delete previously allocated blocks.
        `,
      },
      {
        index: 3,
        description: `
        Start searching for free block from first allocated block. For each contiguous free blocks found, create an extent for these blocks by recording its starting block and its length.
        `,
      },
      {
        index: 4,
        description: `
        Merge all contiguous extents to one extents.
        `,
      },
      {
        index: 5,
        description: `
        Based on extents, set blocks as used in block bitmap.
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
        From the directory entry found, retrieve the inode number. From inode number, retrieve inode data.
        `,
      },
      {
        index: 2,
        description: `
        Allocated blocks are stored in extents. Retrieve allocated blocks from all extents.`,
      },
    ],
  },
}

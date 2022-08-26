<script setup lang="ts">
useHead({
  title: 'FAS - ext4 docs',
})
</script>
# ext4
[[toc]]
Ext4 is the default file system used in Linux operating system.

Ext4 store file using indexed allocation method by recording all blocks allocated to a file using extents. FAS only focus on the allocation of file and only implement the concept of bitmap, inode and extent. Other features of ext4 are not implemented.

## Disk layout
Disk layout of ext4 consist of superblock, group descriptor table, block bitmap, inode bitmap, inode table,  and data blocks. Superblock (not implemented in FAS) records information of filesystem. Group descriptor table (not implemented in FAS) store the location of block bitmap, inode bitmap and inode table. Data blocks is the place to store file data. 

### Disk Block bitmap
- record the state (used/free) of each disk block

### Inode bitmap
- record the state (used/free) of each inode

### Inode table
- store inodes

### Inode
- an unqiue identifier for each file
- each file is allocated with a inode
- record metadata of file such as file name, size, date created, etc.
- extents is also stored in inode

### Extents
- new data structure introduced in ext4
- record the location of data on disk
- able to record more than 1 block disk by recording the start and length of extents, more efficient compare to ext2 / ext3 which record all blocks allocated using indirect block
- each extent record only contiguous blocks
- For example: extent with start of 0 and length of 4 record the location of data on disk from 0 to 4
- each extent is stored in a B+ tree but in FAS it is just an array

<br>
<br>
<br>

## References & Resources

1. djwong, 2022. ext4 Data Structures and Algorithms — The Linux Kernel documentation. [online] Available at: <[https://www.kernel.org/doc/html/latest/filesystems/ext4/index.html](https://www.kernel.org/doc/html/latest/filesystems/ext4/index.html)> [Accessed 26 August 2022].
2. Balci, M., 2017. A Minimum Complete Tutorial of Linux ext4 File System. [online] Available at: <[https://metebalci.com/blog/a-minimum-complete-tutorial-of-linux-ext4-file-system/](https://metebalci.com/blog/a-minimum-complete-tutorial-of-linux-ext4-file-system/)> [Accessed 26 August 2022].
3. Both, D., 2017. An introduction to Linux’s EXT4 filesystem. [online] Opensource.com. Available at: <[https://opensource.com/article/17/5/introduction-ext4-filesystem](https://opensource.com/article/17/5/introduction-ext4-filesystem)> [Accessed 26 August 2022].
4. Anon. 2022. File systems ext2, ext3 and ext4. [online] Available at: <[https://students.mimuw.edu.pl/ZSO/Wyklady/11_extXfs/extXfs_short.pdf](https://students.mimuw.edu.pl/ZSO/Wyklady/11_extXfs/extXfs_short.pdf)> [Accessed 26 August 2022].
5. Porter, D., 2022. Ext3/4 file systems. [online] Available at: <[http://www.cs.unc.edu/~porter/courses/cse506/s16/slides/ext4.pdf](http://www.cs.unc.edu/~porter/courses/cse506/s16/slides/ext4.pdf)> [Accessed 26 August 2022].

<route lang="yaml">
meta:
  layout: docs
  head: FAS - ext4
</route>
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
Disk layout of ext4 consist of superblock, group descriptor table, block bitmap, inode bitmap, inode table,  and data blocks. Superblock (not implemented in FAS) records information of filesystem. Group descriptor table (not implemented in FAS) store the location of block bitmap, inode bitmap and inode table. Data blocks is the place to store file data. Bitmap 

### <u>Disk Block bitmap</u>
- record the state (used / free) of each disk block

### <u>Inode bitmap</u>
- record the state (used / free) of each inode

### <u>Inode table</u>
- store inodes

### <u>Inode</u>
- an unqiue identifier for each file
- each file is allocated with a inode
- record metadata for each file such as file name, size, date created, etc.
- extents is also stored in inode

### <u>Extents</u>
- new data structure introduced in ext4
- record the location of data on disk
- able to record more than 1 block disk by recording the start and length of extents, more efficient compare to ext2 / ext3 which record all blocks allocated using indirect block
- For example: extent with start of 0 and length of 4 record the location of data on disk from 0 to 4
- each extent is stored in a B+ tree but in FAS it is just an array

##### Feature not implemented:
  - Journaling
  - Extent tree
  - Preallocation of blocks

---
## References & Resources
1. <a href="https://www.kernel.org/doc/html/latest/filesystems/ext4/index.html" target="_blank" rel="noopener">ext4 Data Structures and Algorithms</a>
2. <a href="https://metebalci.com/blog/a-minimum-complete-tutorial-of-linux-ext4-file-system/" target="_blank" rel="noopener">A Minimum Complete Tutorial of Linux ext4 File System</a>
3. <a href="https://ext4.wiki.kernel.org/index.php/Ext4_Disk_Layout" target="_blank" rel="noopener">Ext4 Disk Layout</a>
3. <a href="https://opensource.com/article/17/5/introduction-ext4-filesystem" target="_blank" rel="noopener">An introduction to Linux's EXT4 filesystem</a>
4. <a href="https://students.mimuw.edu.pl/ZSO/Wyklady/11_extXfs/extXfs_short.pdf" target="_blank" rel="noopener">File systems ext2, ext3 and ext4 </a>
5. <a href="http://www.cs.unc.edu/~porter/courses/cse506/s16/slides/ext4.pdf" target="_blank" rel="noopener">Ext3/4 file systems</a>


<route lang="yaml">
meta:
  layout: docs
  head: FAS - ext4
</route>
<script setup lang="ts">
useHead({
  title: 'FAS - FAT docs',
})
</script>
# FAT

[[toc]]
FAT is an simple and lightweight file system commonly used in embedded devices, portable flash drives. 


The FAT file system of FAS is implemented based on the FAT32 variation. The smallest disk unit used by FAT is cluster which is group of disk sectors but in FAS it is disk block. FAT able to store file discontiguously on the disk by utilize the **file allocation table** to map disk block with file. **Directory entry** is a metadata for each files which stores information such as file name, file size and **first fat index**.

In FAS, the reserved disk block of FAT is to simulate the file system reserved sector which is used for boot data and file allocation table.

## Disk layout

FAT file system can be divided into three regions: the boot regions, the file allocation table regions and the data regions.

### <u>Boot region</u>
- reserved to store file system information such as number of sectors per cluster, number of reserved sector.

### <u>File allocation table region</u>
- store the file allocation table.
- the data structure that map data to each disk block.
- each entry in the table represent a disk block and it record the current state of the disk block  
  - if it is allocated,
    - it stores the next fat index which point to the next file data until the end of the file is reach.
    - For example, for file allocation table below:

      | index      | value                                      |
      |------------|--------------------------------------------|
      | ...        | ...                                       |
      | 4          | 6                                          |
      | 5          | 15                                         |
      | 6          | 7                                          |
      | 7          | END                                        |
      | ...        | ...                                        |

      For instances, for file with first fat index of 4. From the file allocation table, in entry 4, it stores the value of 6 which means the next piece of data is stored in fat index of 6. Then in fat index of 6, the next piece of data is stored in fat index of 7. The end of the file is reached when fat index of 7. This means that the file is stored in these 3 blocks of disk. By knowing the first 

  - if it is not allocated,
    - it indicate it is free.
- the first two entry in the table is reserved for file system usage.
- the third entry is used for the root directory.

### <u>Data region</u>
- directory entries and file data are stored at here.
- directory entries is metadata of file which consist information such as first cluster number, file name, file size, date created

#### Feature not implemented:
  - File name (Long and Short)
  - Directory

---
## References & Resources
1. [FatFs](http://elm-chan.org/fsw/ff/00index_e.html)
2. <a href="https://download.microsoft.com/download/1/6/1/161ba512-40e2-4cc9-843a-923143f3456c/fatgen103.doc" target="_blank" rel="noopener">Microsoft FAT Specification</a>
3. <a href="https://www.cs.fsu.edu/~cop4610t/lectures/project3/Week11/Slides_week11.pdf" target="_blank" rel="noopener">FAT32 Boot Sector,
Locating Files and Dirs</a>
3. <a href="https://cscie92.dce.harvard.edu/spring2021/slides/FAT32%20File%20Structure.pdf" target="_blank" rel="noopener">FAT32 File Structure</a>
4. <a href="http://www.c-jump.com/CIS24/Slides/FAT/lecture.html" target="_blank" rel="noopener">The FAT File System
</a>

<route lang="yaml">
meta:
  layout: docs
  head: FAS - FAT
</route>
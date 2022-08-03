# File Allocation Simulator FAS

#### Implemented File System
  - <router-link class="hover:text-blue-500" to="/docs/fat">FAT</router-link>
  <!-- - <router-link class="hover:text-blue-500" to="/docs/ext4">ext4</router-link> -->

## Introduction

FAS is a learning tool in learning file system by allow the simulation of file action (create, delete, read, write, append) on a file system and visualize how the data are stored in the disk.

FAS focus on the allocation of file, the data structure, how files are being read and write in different file system.

The file size used in FAS does not follow the real file size. The smallest data unit is 1 disk block. All file size are base on disk block.

It simplify the concept of file system and does not represent the real implementation of the file system. But it give a general idea for understanding how a file system works. 

FAS does not support creation of directory,  all files created are considered as regular file and all files are stored in the root directory.

## Guide

To get started, 
1. Select any file system and enter a disk size then click the "Format" button.
2. The perform any action (create, delete, write, append and read) by specify a file name, size and select an action.
3. Detailed steps and animation will be shown.
4. Animation could be paused, resumed or disabled.

For more precise information on each function of the app, app tour is provided by pressing the "Help" button.

## File action
Create: Create a new file
- demonstrate how the file is created in the file system

<br>

Delete: delete existing file
- demonstrate how existing file locate and delete

<br>

Read: read existing file
- demonstrate how a file is allocated in a file system.

<br>

Append: Append size to existing file
- increase file size by the size of append.
- ex: For action of appending 20 size to a file of 10 size, the file will become 30 size.

<br>

Write: Write size to existing file
- overwrite the file with the size of write.
- ex: For action of writing 20 size to a file of 10 size, the file will become 20 size.

<route lang="yaml">
meta:
  layout: docs
</route>

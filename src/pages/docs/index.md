<script setup lang="ts">
useHead({
  title: 'FAS - Docs',
})
</script>

# File Allocation Simulator (FAS)
#### Implemented File System
  - <router-link class="hover:text-blue-500 !text-blue-6" to="/docs/fat">FAT</router-link>
  - <router-link class="hover:text-blue-500 !text-blue-6" to="/docs/ext4">ext4</router-link>

<hr>
Table of content

  [[toc]]

## Introduction

FAS is a learning tool to learn file system through the simulation of file action (create, delete, read, write, append) on a file system and visualize how the data are stored in the disk. File system is the that define the structure of the disk and the way the data are stored. File system aims to achieve better performance by make sure data of a file are stored contiguously on the disk which increase the reading speed according to Principle of Locality.

FAS focus on the allocation of file, the data structure and how files are being read and write in different file system. The free block searching algorithm implemented using first fit for creation of file. All file size are base on disk block.

It simplify the concept of file system and does not represent the real implementation of the file system. But it provide a general idea for understanding how a file system works. 

FAS does not support creation of directory, all files created are considered as regular file and all files are stored in the root directory.

## Quick Start

To get started, 
1. Select any file system and enter a disk size then click the "Format" button.
2. The perform any action (create, delete, write, append and read) by specify a file name, size and select an action.
3. Detailed steps and animation will be shown.
4. Animation could be paused, resumed or disabled.
  
For new user / beginner it is recommended to set animation to manual mode and observe each step. The recommended disk size is between 100 to 150. The maximum size allowed size is 200.

For more information on each function of the app refer to documentation below, app tour is provided by pressing the "Guide" button.

## File action
### Create: create a new file
- demonstrate how the file is created in the file system
- show that how a file is stored into disk blocks
  
### Delete: delete existing file
- demonstrate how existing file is located and deleted from the file system
  
### Read: read existing file
- demonstrate how a file is located by providing file name
- shows that how a file is read from disk blocks

### Append: append size to existing file
- increase file size by the size of append.
- Example: For action of appending 20 size to a file of 10 size, the file will become 30 size.
  
### Write: write size to existing file
- overwrite the file with the size of write.
- Example: For action of writing 20 size to a file of 10 size, the file will become 20 size.

## Functions

### Input
Simulation is performed by selecting an file action and enter an file name and file size. For action of read and delete, the file size is not required. 

- #### Input Generation
Input can be generate by clicking on the <span class="i-mdi:cogs icon-btn inline-block align-sub"></span> button. If no files are created, the file action generated will always be create. 

Generation of input can be locked by opening the generation preference settings <span class="i-fluent:caret-down-24-filled icon-btn inline-block align-sub"></span> (beside the generation icon). For example, if file action are locked, file action remains the same in each generated input.


### Disk Blocks
The disk block section show the status of each disk blocks. Status of disk blocks can be identified by its color, for white it means it is free else it is used or reserved.

### Animation / Actions
To pause the animation, user could click the Pause button (<span class="i-ic:round-pause-circle inline-block align-sub" />) or pressing "**P**" key on keyboard. 

When animation is paused, user would need to go to next step manually by clicking the forward button (<span class="i-fluent:fast-forward-16-filled inline-block align-sub"/>) or pressing "**N**" key on keyboard. To resume the animation, user could click the Play button (<span class="i-ic:round-play-circle inline-block align-sub" />) or pressing "**P**" key on keyboard. 

While an animation is not completed, all other action such as format disk, create file is disabled. User could choose to instantly complete current action by click on the "Skip" button. User could also choose to cancel current action and revert to previous state by click on the "Cancel" button.

### Import / Export

The application state can be exported to a file or copied to clipboard by by clicking the export button (<span class="i-carbon:export icon-btn"></span>) to open the export interface. All file actions is recorded automically once the disk is formatted. When a disk is formatted, previous action will be cleared.

To import application state, user can click on the import button (<span class="i-mdi:database-import icon-btn"></span>) to open the import interface and select to import by paste from clipboard or upload JSON file.

### Disk Info

The disk info section show the details of the disks such as used disks block and free disk block. The fragmentation percentage in FAS is calculated based on the following formula: 
  
  (number of free disk blocks - largest continguous free blocks) /  total free blocks x 100


- #### Defragmentation

Clicking on the "Perform Defragmentation" button will perform defragmentation which reallocate each files to sit contiguously and eliminates any discontiguous free blocks.



<br>
<br>
<hr>
<route lang="yaml">
meta:
  layout: docs
</route>

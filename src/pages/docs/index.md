<script setup lang="ts">
useHead({
  title: 'FAS - Docs',
})
</script>
# FAS - File Allocation Simulator

#### Implemented File System
  - <router-link class="hover:text-blue-500" to="/docs/fat">FAT</router-link>
  - <router-link class="hover:text-blue-500" to="/docs/ext4">ext4</router-link>

## Introduction

FAS is a learning tool in learning file system by allow the simulation of file action (create, delete, read, write, append) on a file system and visualize how the data are stored in the disk.

FAS focus on the allocation of file, the data structure, how files are being read and write in different file system.

The file size used in FAS does not follow the real file size. The smallest data unit is 1 disk block. All file size are base on disk block.

It simplify the concept of file system and does not represent the real implementation of the file system. But it provide a general idea for understanding how a file system works. 

FAS does not support creation of directory, all files created are considered as regular file and all files are stored in the root directory.

## Guide

To get started, 
1. Select any file system and enter a disk size then click the "Format" button.
2. The perform any action (create, delete, write, append and read) by specify a file name, size and select an action.
3. Detailed steps and animation will be shown.
4. Animation could be paused, resumed or disabled.

For more precise information on each function of the app, app tour is provided by pressing the "Guide" button.

#### Animation / Actions
To pause the animation, user could click the Pause button (<span class="i-ic:round-pause-circle inline-block align-sub" />) or pressing "**P**" key on keyboard. 

When animation is paused, user would need to go to next step manually by clicking the forward button (<span class="i-fluent:fast-forward-16-filled inline-block align-sub"/>) or pressing "**N**" key on keyboard. To resume the animation, user could click the Play button (<span class="i-ic:round-play-circle inline-block align-sub" />) or pressing "**P**" key on keyboard. 

While an animation is not completed, all other action such as format disk, create file is disabled. User could choose to instantly complete current action by click on the "Skip" button. User could also choose to cancel current action and revert to previous state by click on the "Cancel" button.

## File action
### Create: create a new file
- demonstrate how the file is created in the file system
  
### Delete: delete existing file
- demonstrate how existing file locate and delete
  
### Read: read existing file
- demonstrate how a file is allocated in a file system.

### Append: append size to existing file
- increase file size by the size of append.
- Example: For action of appending 20 size to a file of 10 size, the file will become 30 size.
  
### Write: write size to existing file
- overwrite the file with the size of write.
- Example: For action of writing 20 size to a file of 10 size, the file will become 20 size.

---


<route lang="yaml">
meta:
  layout: docs
</route>

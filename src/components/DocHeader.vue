<script lang="ts" setup>

</script>

<template>
  <nav class="flex items-center px-2 py-2 gap-x-4" bg="#d7e3f4">
    <RouterLink to="/">
      <div class=" icon-link flex items-center gap-x-2" title="Back to application">
        <div i-mdi:arrow-left text="5" mr--2 />
        <div i-icon-park-outline:hard-disk />
        FAS
      </div>
    </RouterLink>

    <RouterLink v-if="$route.name !== 'docs'" to="/docs">
      <div class=" icon-link flex items-center gap-x-2" title="Back to menu">
        <div i-mdi:arrow-u-left-top text="5" mr--2 />
        <span text="7">.. <span text="4">(Back to upper level)</span></span>
      </div>
    </RouterLink>
  </nav>
</template>

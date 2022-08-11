<script setup lang="ts">
import { useNotify } from '~/composables/useNotify'

const { notiState } = useNotify()
</script>

<template>
  <teleport to="#notification">
    <transition name="slide-fade" mode="out-in">
      <div v-if="notiState.showNotification" class="fixed bottom-0 right-0 mb-25 md:mr-5 lg:mr-15 z-600">
        <div v-if="notiState.showNotification" :class="notiState.styles" role="alert">
          <div flex items-center justify="between" px="8" py="3" shadow="md">
            <div>
              <p class="font-bold">
                {{ notiState.type }}
              </p>
              <p w="25rem">
                {{ notiState.message }}
              </p>
            </div>
            <button i-mdi:close text="black/30" hover="text-black/70" mx="1" @click="notiState.toggleNoti()" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.noti-info{
  --at-apply: bg-blue-100 border-l-4 border-blue-500 text-blue-700
}
.noti-error{
  --at-apply: bg-red-100 border-l-4 border-red-500 text-red-700
}
.noti-success{
  --at-apply: bg-green-100 border-l-4 border-green-500 text-green-700
}
/*animation*/
 .slide-fade-enter-active {
   transition: all .3s ease;
 }

 .slide-fade-leave-active {
   transition: all .8s ease;
 }

 .slide-fade-enter,
 .slide-fade-leave-to
   {
   transform: translatey(-10px);
   opacity: 0;
 }

 .slide-fade-enter
   {
   transform: translatey(10px);
   opacity: 0;
 }
</style>

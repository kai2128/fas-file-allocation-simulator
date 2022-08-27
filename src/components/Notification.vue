<script setup lang="ts">
import { useNotify } from '~/composables/useNotify'

const { notiQueue, closeNoti } = useNotify()
</script>

<template>
  <teleport to="#notification">
    <!-- <transition name="slide-fade" mode="out-in">
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
    </transition> -->
    <div class="fixed bottom-0 right-0 mb-25 md:mr-5 lg:mr-15 z-600 ">
      <div class="flex flex-col gap-y-2">
        <TransitionGroup name="list">
          <div v-for="notiState of notiQueue" :key="notiState.id">
            <div :class="notiState.styles" role="alert">
              <div flex items-center justify="between" px="8" py="3" shadow="md">
                <div>
                  <p class="font-bold">
                    {{ notiState.type }}
                  </p>
                  <p w="25rem">
                    {{ notiState.message }}
                  </p>
                </div>
                <button i-mdi:close text="black/30" hover="text-black/70" mx="1" @click="closeNoti(notiState.id)" />
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
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
.list-move,
 .list-enter-active {
  transition: all 0.2s ease-in-out;
 }

 .list-leave-active {
  transition: all 0.4s ease-in-out;
 }

 /* .list-enter-from, */
 .list-leave-to{
   transform: translateY(-100px);
   opacity: 0;
 }

 .list-enter-from
   {
   transform: translateX(20px);
   opacity: 0;
 }
</style>

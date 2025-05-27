<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup></script>

<style lang="scss">
#app {
  scroll-behavior: auto;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  background-color: transparent;
}
</style>

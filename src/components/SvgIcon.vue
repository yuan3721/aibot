<template>
    <svg :class="[svgClass, 'svgClass']" aria-hidden="true" :style="{ color, width, height }">
      <use :xlink:href="`${symbolId}`" />
    </svg>
</template>

<script setup>
import { defineProps, computed } from 'vue'
const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: 'icon'
  },
  color: {
    type: String,
    default: ''
  },
  currentColor: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '18px'
  },
  height: {
    type: String,
    default: '18px'
  },
  svgClass: {
    type: String,
    default: ''
  }
})
 const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<style scoped>
/* .svgClass {
  width: 20px;
  height: 20px;
  color: red;
} */

</style>
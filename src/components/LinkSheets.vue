<template>
  <span>
    <van-cell v-if="!single && msg?.onlineCount" is-link :title="!msg?.onlineCount ? '搜索中...' : `引用${msg?.onlineCount}篇资料作为参考`"
      @click="triggerOnlineShow" />
    <span v-else @click="triggerOnlineShow">
      <span class="link-tag" v-for="(item, index) in quoteList" :key="index">{{ item }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { defineProps, computed, inject } from 'vue';

const triggerParent = inject('parentMethod');

const props = defineProps<{
  msg: {
    reasoning: string;
    onlineList: [];
    online: boolean;
    onlineCount: 0;
    onlineEnd: boolean;
  };
  single?: boolean,
  quoteString?  : String,
}>();

const showOnline = computed(() => {
  const msg = props.msg;
  if (!msg.online || !msg.onlineCount) return false;
  
  if (msg.onlineEnd && msg.onlineCount <= 0) return false;
  return true;
})
const quoteList = computed(() => {
  return props?.quoteString?.split(',')
})

const quoteContentList = computed(() => {
  if (!props.single) {
    return props.msg?.onlineList || []
  }
  return props.msg?.onlineList?.filter((item) => {
    return quoteList.value?.includes(item.Index + '')
  }) || []
})

const triggerOnlineShow = () => {
  triggerParent(quoteContentList.value);
};

</script>

<style>

.van-collapse-item__content {
  display: flex;
}

.van-collapse-item__content:before {
  content: '';
  width: 2px;
  height: auto;
  background: #DEDEDE;
  padding-left: 2px;
  margin: 0 4px 0 0;
  display: inline-block;
}

</style>
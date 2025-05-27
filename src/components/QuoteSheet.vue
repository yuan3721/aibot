<template>
  <van-cell-group>
    <van-nav-bar :title="iframeTitle" @click-left="onClickLeft">
      <template #left>
        <SvgIcon name="back" color="#000000" width="22px" height="22px" />
      </template>
    </van-nav-bar>
    <div v-show="progress" id="progress-bar" :style="{ width: progress + '%' }"></div>
    <iframe id="myIframe" :src="iframeUrl" frameborder="0" width="100%" class="link-content-iframe" @load="onIframeLoad"></iframe>
  </van-cell-group>
</template>
<script setup lang="ts">
import { defineProps, ref } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import { useChatStore } from '@/store/chatStore';
import { storeToRefs } from 'pinia';
const store = useChatStore();
const { progress } =  storeToRefs(store);

const progressTimer = null;

const props = defineProps({
  iframeUrl: {
    type: String,
    default: '',
  },
  iframeTitle: {
    type: String,
    default: '',
  },
  iframeShow: {
    type: Boolean,
    default: false,
  },
  hideIframe: {
    type: Function,
    default: () => { },
  },
});


const onIframeLoad = () => {
  progress.value = 100;
  setTimeout(() => {
    progress.value = 0; // 进度条隐藏
  }, 500);
};

const onClickLeft = () => {
  props.hideIframe && props.hideIframe();
};
</script>

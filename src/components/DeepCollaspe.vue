<template>
    <van-collapse v-show="msg.reasoning" v-model="activeName" :border="false" class="message-reason-container">
      <van-collapse-item title="深度思考" name="1" :border="false">
        <span class="message-reason-content">
           {{ msg.typingIndex === undefined ? msg.reasoning : msg.displayedReasoning }}
        </span>
      </van-collapse-item>
    </van-collapse>
  </template>
  
  <script setup lang="ts">
  import { ref, defineProps, watch, onMounted } from 'vue';
  import 'vant/lib/collapse-item/style';
  import 'vant/lib/collapse/style';

  const props = defineProps<{
    msg: {
      reasoning: string;
      displayedReasoning: string;
      typingIndex: number | undefined;
    };
  }>();
  
  const activeName = ref(['1']);
 
  </script>
  
  <style lang="scss">
  .message-reason-container {
    margin-bottom: 24px;
  }
  .van-cell {
    background: transparent;
    padding: 0;
    margin-bottom: 14px;
    &__title {
      flex: unset;
      color: #333;
      font-weight: 400;
    }
    .van-icon {
      color: #737373;
    }
  }
  .van-collapse-item__content {
    display: flex;
    background: transparent;
    padding: 0;
    color: #474747;
    font-size: 13px;
    line-height: 20px;
  }
  .van-collapse-item__content:before {
    content: '';
    width: 2px;
    height: auto;
    background: #dedede;
    padding-left: 2px;
    margin: 0 4px 0 0;
    display: inline-block;
  }
  .message-reason-content {
    white-space: pre-wrap;
  }
  </style>
<template>
  <div v-for="(quoteItem) in quoteContentList" :key="quoteItem.Index + quoteItem.Title" class="link-card"
    @click="jumpToUrl(quoteItem.Url, quoteItem.SiteName)">
    <div class="link-card-container">
    <p class="link-card-title" v-html="quoteItem.Title"></p>
    <p v-if="quoteItem.SiteName" class="link-card-item">
      <span class="link-card-site">{{ quoteItem.SiteName }}</span>
      <img v-if="quoteItem.Icon" class="link-card-icon" :src="quoteItem.Icon" alt="icon">
    </p>
  </div>
    <SvgIcon v-if="quoteItem.Url" class="link-detail" name="linkdetail" width="18" height="18"/>
  </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue';

import SvgIcon from './SvgIcon.vue';

const props = defineProps<{
  quoteContentList: [],
  hideSheet: Function,
  jumpToUrl: Function
}>();

</script>
<style lang="scss">
.link-sheet-container {
  /* min-height: 200px; */
  border-radius: 12px 12px 0px 0px;
  background: #f3f3f3 !important;

  .van-action-sheet__header {
    text-align: left;
    padding-left: 5%;

    .van-action-sheet__close {
      position: absolute;
      top: 15px;
    }
  }

  .van-action-sheet__content {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-bottom: 20px;
    max-height: 70vh;
    /* justify-content: center; */
  }

  .link-card {
    display: flex;
    width: 90%;
    background: #fff;
    border-radius: 10px 12px 12px 10px;
    padding: 12px 10px;
    margin-bottom: 10px;
    color: #1a1a1a;
    font-family: 'PingFang SC';
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: 16px;
    flex-shrink: 0;

    .link-card-container {
      flex: 1
    }

    .link-detail  {
      align-self:  center;
      color: #C4C4C4;
      margin-left: 16px;
    }

    .link-card-title {
      padding-top: 0;
      margin-top: 0;
      margin-bottom: 0;
      line-height: 20px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .link-card-item {
      display: flex;
      align-items: center;
      margin: 10px 0 0;
      padding: 0;
    }

    .link-card-icon {
      width: 14px;
      height: 14px;
      margin-left: 10px;
      border-radius: 50%;
    }

    .link-card-site {
      color: #666;
      font-family: 'PingFang SC';
      font-size: 11px;
      font-style: normal;
      font-weight: 400;
      line-height: 12px;
    }
  

  }
}
</style>
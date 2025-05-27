<template>
  <div class="chat-container">
    <!-- 导航栏 -->
    <van-nav-bar :title="chatTitle" :style="{marginTop: top + 'px'}">
      <template #left v-if="isBottomBar">
        <SvgIcon name="menu" color="#000000" width="32px" height="32px" @click="showPopup" />
      </template>
      <template #left v-else>
        <SvgIcon name="back" color="#000000" width="22px" height="22px" @click="closePage" />
      </template>
      <template #right>
        <SvgIcon style="margin-right: 10px" name="newDialog" color="#000000" width="32px" height="32px"
          @click="openNewSession" />
        <SvgIcon v-if="!isBottomBar" name="menu2" color="#000000" width="32px" height="32px" @click="showPopup" />
      </template>
    </van-nav-bar>
    <!-- 聊天对话 -->
    <ChatContainer />
    <!-- 键盘输入 -->
    <InputContainer :showAds="showAds" :isBottomBar="isBottomBar">
      <div id="scroll-button" class="new-session__container">
        <img class="new-session" :src="BottomPng" alt="" @click="clickToBottom" />
      </div>
    </InputContainer>
    <!-- 历史记录popup -->
    <van-popup v-model:show="showRight"  :position="isBottomBar ? 'left':'right'" :style="historyPopStyle"
      :overlay-style="{ background: 'rgba(0, 0, 0, 0.3)' }" @open="getHistory">
      <HistoryPop :chatGroups="chatGroups || {}" :hideRight="hideRight" :refresh="getHistory" />
    </van-popup>

    <!-- 引用来源列表 popup -->
    <van-action-sheet v-model:show="activeShow" :title="quoteListTitle" class="link-sheet-container">
      <OnlineContent :quoteContentList="quoteContentList" :hideSheet="hideSheet" :jumpToUrl="jumpToUrl" />
    </van-action-sheet>

    <!-- 单个来源iframe iframe popup -->
    <van-action-sheet v-model:show="iframeShow" class="link-content-container">
      <QuoteSheet :iframeUrl="iframeUrl" :iframeTitle="iframeTitle" :iframeShow="iframeShow" :hideIframe="hideIframe" />
    </van-action-sheet>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide, nextTick, computed, } from 'vue';
import Visibility from 'visibilityjs';
import SvgIcon from '@/components/SvgIcon.vue';
import ChatContainer from '@/components/ChatContainer.vue';
import InputContainer from '@/components/InputContainer.vue';
import HistoryPop from '@/components/HistoryPop.vue';
import { getAIDeepSeekSessions } from '@/api/tutuApiWiFi/index.api';
import 'vant/lib/toast/style';
import 'vant/lib/toast/style';
import 'vant/lib/button/style';
import { groupMessages, isIOS } from '@/utils/helper';
import { useChatStore } from '@/store/chatStore';
import OnlineContent from '@/components/OnlineContent.vue';
import QuoteSheet from '@/components/QuoteSheet.vue';
import { storeToRefs } from 'pinia';
import { showToast } from 'vant'

const store = useChatStore();
const showAds = ref(false);
const { enableAutoScroll, progress, messages, sessionId } = storeToRefs(store);
const { 
  openNewSession, 
  tracker, 
  scrollToBottom, 
} = store;

const showRight = ref(false);
const activeShow = ref(false);
const quoteContentList = ref([]);
const chatGroups = ref();

const iframeUrl = ref('');
const iframeShow = ref(false);
const iframeTitle = ref('');
const progressTimer = ref(null);
const isBottomBar = location.href.indexOf('tabSource') > -1;

const historyPopStyle = {
  width: '77%',
  height: '100%',
  padding: '20px 10px 20px 20px',
  display: 'flex',
  flexDirection: 'column',
}

const showPopup = () => {
  showRight.value = true;
};

const triggerOnlineShow = (showList) => {
  if (showList && showList.length) {
    activeShow.value = true;
    quoteContentList.value = showList;
  }
};

provide('parentMethod', triggerOnlineShow);

const quoteListTitle = computed(() => {
  return `引用来源${quoteContentList.value.length > 1 ? `（${quoteContentList.value.length}）` : ''
    }`;
});

let totalTime = 0;
let startTime = +new Date();

let lastVisibilityState = Visibility.hidden(); // 记录上一次的可见性状态

// 初始化 startTime
if (!lastVisibilityState) {
  startTime = +new Date(); // 页面初始为可见状态时记录开始时间
}

const chatTitle = computed(() => {
  return messages.value.filter((i) => i.role === 'user')[0]?.text || '新对话'
})

tracker('ai_chatbot_h5_created');

const top = ref(0);


onMounted(async () => {
  console.log('页面加载完成,optimized');

  !isBottomBar && tracker('ai_chatbot_h5_show');
  
  isBottomBar && window?.tutu?.feed?.getNearbyTopOffset().then((data) => {
    top.value = data?.data?.statusBarHeight  || 0;
  })

  if(isIOS()) {
    window?.tutu?.common?.setStatusBarState( {
      visible:true,
      backgroundColor:"#F4F6FA"
    }).catch((e) => {
      console.log(e)
    })
  }



  
  window.addEventListener("touchmove", () => {
    enableAutoScroll.value = false;
  });

  




  
  const onRequestSuccess = (data) => {
      const parsedData = JSON.parse(data.data);
      if (+parsedData.code === 1) {
        showAds.value = true;
      }
    }
  const onClose = (data) => {
      const parsedData = JSON.parse(data.data);
      if (+parsedData.code === 20) { // 手动关闭
        showAds.value = false;
      }
    }
  const onError = () => {
      showAds.value = false;
    }


  
  let appearTime = 0;


});




const hideRight = () => {
  showRight.value = false;
};

const hideSheet = () => {
  activeShow.value = false;
};

const hideIframe = () => {
  iframeShow.value = false;
  iframeUrl.value = '';
};

const clickToBottom = () => {
  enableAutoScroll.value = true;
  scrollToBottom();
};

const simulateProgress = () => {
  progress.value = 10;
  progressTimer.value = setInterval(() => {
    if (progress.value < 80) {
      progress.value += Math.random() * 20; // 逐步增加进度
    } else {
      clearInterval(progressTimer.value); // 停止模拟
    }
  }, 200);
}

const jumpToUrl = (url, title) => {
  if (url) {
    iframeUrl.value = "";// 清空iframe
    activeShow.value = false;
    iframeShow.value = true
    iframeTitle.value = title
    progress.value = 10;
    nextTick(() => {
      iframeUrl.value = url
      simulateProgress()
    })
  }
}


const getHistory = async () => {
  const historyRes = await getAIDeepSeekSessions({
    page: 1,
  }).catch((e) => {
    showToast('获取历史消息失败')
    return {};
  });

  const dsSessions = historyRes?.sessions?.filter((item) => {
    return !!item.firstMsg;
  });
  chatGroups.value = groupMessages(dsSessions);
};
</script>

<style lang="scss">
/* 进度条样式 */
#progress-bar {
  position: absolute;
  width: 0;
  height: 4px;
  background: #0285f0;
  transition: width 0.4s ease-in-out;
}

.van-nav-bar {
  background: #f4f6fa;

  &::after {
    display: none;
  }

  .van-nav-bar__title {
    max-width: calc((100vw - 150px) * 0.8);
  }

  .van-nav-bar__right {
    padding: 0 12px;
  }
}

#app {
  scroll-behavior: auto;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  background-color: transparent;
}



.van-list {
  padding-top: 10px;
  padding-bottom: 60px;
  background-color: #f4f6fa;
  height: 100%;
  flex-grow: 0;
  overflow-y: auto;
}

.van-popup {
  .van-list {
    background-color: #fff;
  }

  .pop-list-container {
    overflow: hidden;
    flex: 1;
  }

  .van-cell__title {
    width: 100%;

    span {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      display: block;
      width: 100%;
    }
  }
}

.messages {
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
  // gap: 25px;
}

.split-line {
  margin: 25px 3px;
  height: 0px;
  width: calc(100% - 6px);
  // background: #E4E6EB;
  border-bottom: 1px dashed #e4e6e8;
}

.recommend {
  // padding: 10px;
  // background-color: #f4f4f4;
  // border-radius: 5px;
  display: flex;
  flex-direction: column;
  width: 100%;

  &-hint {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 12px;
    font-size: 12px;
    font-weight: 400;
    color: #8f939c;

    &__change {
      display: flex;
      align-items: center;

      div {
        margin-left: 4px;
      }

      &:active {
        background: #f9f9f9;
      }
    }
  }

  p {
    margin-bottom: 10px;
    color: '#97A1A8;';
  }
}

.empty-history-hint {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  &__title {
    color: #222;
    font-weight: 500;
    font-size: 18px;
    line-height: 18px;
    margin-bottom: 16px;
  }

  &__desc {
    font-size: 14px;
    line-height: 20px;
    color: #666;
    margin-bottom: 20px;
    text-align: center;
  }

  &__btn {
    border-radius: 10px;

    // color: red;
    .van-button__text {
      color: #333;
      display: flex;
      align-items: center;
    }
  }
}



.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50% !important;
  margin: 0 5px;
}

@keyframes rotate360 {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.seach-button {
  display: flex;
  padding: 6px 14px;
  align-items: center;
  border-radius: 1000px;
  border: 1px solid #dedede;
  background: #fff;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.05);
  color: #333;
  font-family: 'PingFang SC';
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  /* 133.333% */
  margin-right: 12px;
}

.new-session__container {
  position: absolute;
  margin-top: -60px;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  max-height: 60px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.van-cell-group__title {
  padding: 0 12px;
  margin: 10px 0 6px;
  color: #8b8b8b;
}

.chat-list__item {
  margin: 0;
  padding: 12px 28px 12px 10px;
  border-radius: 10px;
  line-height: 16px;
  font-size: 14px;
  color: #0a0a0a;

  &:after {
    display: none;
  }

  // margin: 0 10px;
  // padding: 12px 10px;
  // width: calc(100% - 24px);
  // border-radius: 10px;
  &.active {
    background: rgba(#0285f0, 0.1);
    color: #0285f0;
  }
}

[class*='van-hairline']:after {
  border: none;
}

.link-content-container {
  .link-content-iframe {
    height: 85vh;
  }
}
</style>
<style>
:root {
  --van-field-input-text-color: #333;
}
</style>

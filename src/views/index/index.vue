<template>
  <div class="chat-container">
    <!-- 导航栏 -->
    <van-nav-bar :title="chatTitle" :style="{marginTop: top + 'px'}">

      <template #left>
        <SvgIcon name="back" color="#1e293b" width="22px" height="22px" />
      </template>
      <template #right>
        <SvgIcon style="margin-right: 10px" name="newDialog" color="#1e293b" width="32px" height="32px"
          @click="openNewSession" />
        <!-- <SvgIcon v-if="!isBottomBar" name="menu2" color="#1e293b" width="32px" height="32px" @click="showPopup" /> -->
      </template>
    </van-nav-bar>
    <!-- 聊天对话 -->
    <ChatContainer />
    <!-- 键盘输入 -->
    <InputContainer :showAds="showAds" >
      <!-- <div id="scroll-button" class="new-session__container">
        <img class="new-session" :src="BottomPng" alt="" @click="clickToBottom" />
      </div> -->
    </InputContainer>
    <!-- 历史记录popup -->
    <van-popup v-model:show="showRight" :style="historyPopStyle"
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
import { getAIDeepSeekSessions } from '@/api/index.ts';
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



const top = ref(0);


onMounted(async () => {
  console.log('页面加载完成,optimized');



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
:root {
  --van-field-input-text-color: #1e293b;
  --van-cell-background-color: transparent;
  --van-popup-background-color: rgba(148, 163, 184, 0.95);
  --van-nav-bar-background-color: transparent;
  --van-action-sheet-background-color: rgba(148, 163, 184, 0.95);

  /* 更浅的科技感配色方案 */
  --primary-bg: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  --secondary-bg: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%);
  --card-bg: rgba(248, 250, 252, 0.9);
  --card-border: rgba(203, 213, 225, 0.6);
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --secondary-gradient: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  --accent-color: #6366f1;
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --hover-glow: rgba(99, 102, 241, 0.3);
  --glass-effect: backdrop-filter: blur(15px);
}

/* 进度条样式 */
#progress-bar {
  position: absolute;
  width: 0;
  height: 4px;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
  transition: width 0.4s ease-in-out;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.van-nav-bar {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%);
  color: #1e293b;

  &::after {
    display: none;
  }

  .van-nav-bar__title {
    max-width: calc((100vw - 150px) * 0.8);
    color: #1e293b;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.1);
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
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
}



.van-list {
  padding-top: 10px;
  padding-bottom: 60px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  height: 100%;
  flex-grow: 0;
  overflow-y: auto;
}

.van-popup {
  .van-list {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    color: #1e293b;
  }

  .pop-list-container {
    overflow: hidden;
    flex: 1;
  }

  .van-cell__title {
    width: 100%;
    color: #1e293b;

    span {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      display: block;
      width: 100%;
      color: #475569;
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
  border-bottom: 1px dashed #94a3b8;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.1);
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
    color: #64748b;

    &__change {
      display: flex;
      align-items: center;

      div {
        margin-left: 4px;
        color: #475569;
      }

      &:active {
        background: rgba(99, 102, 241, 0.1);
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
    color: #1e293b;
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    margin-bottom: 16px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.1);
  }

  &__desc {
    font-size: 14px;
    line-height: 20px;
    color: #64748b;
    margin-bottom: 20px;
    text-align: center;
  }

  &__btn {
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);

    .van-button__text {
      color: #ffffff;
      display: flex;
      align-items: center;
      font-weight: 500;
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
  padding: 8px 16px;
  align-items: center;
  border-radius: 20px;
  border: 1px solid rgba(203, 213, 225, 0.8);
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(15px);
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  color: #475569;
  font-family: 'PingFang SC';
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  margin-right: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: #6366f1;
    box-shadow: 0px 6px 25px rgba(99, 102, 241, 0.4);
    transform: translateY(-2px);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0px 2px 10px rgba(99, 102, 241, 0.3);
  }
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
  color: #64748b;
}

.chat-list__item {
  margin: 0;
  padding: 12px 28px 12px 10px;
  border-radius: 10px;
  line-height: 16px;
  font-size: 14px;
  color: #475569;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(203, 213, 225, 0.6);
  transition: all 0.3s ease;

  &:after {
    display: none;
  }

  &:hover {
    background: rgba(248, 250, 252, 0.95);
    border-color: #6366f1;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
  }

  &.active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    color: #6366f1;
    border-color: #6366f1;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
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

</style>

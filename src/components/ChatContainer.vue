<template>
  <van-list ref="chatContainer" id="chat-container-box">
    <div class="messages">
      <div v-for="(msg, index) in messages" :key="msg.text + msg.id + index" class="message"
        :class="[msg.role, msg.showRecommend ? 'welcome' : '']">
        <div :class="['message-content', `message-content-${msg.role}`]" :data-msg="msg.id">
          <div v-if="msg.role === 'ai'">
            <template v-if="msg.text || msg.reasoning">
              <LinkSheet v-if="msg.online" :msg="msg" @triggerOnlineShow="triggerOnlineShow" />
              <ThinkCollaspe :msg="msg" />
              <VueShowdown :markdown="msg.typingIndex === undefined ? msg.text : msg.displayedText" :msg="msg"
                flavor="github" :extensions="[referenceExtension, hideExtension]" :options="{ emoji: true }"
                @triggerOnlineShow="triggerOnlineShow" />
            </template>
            <div v-else>
              <ImgLoading />
            </div>
          </div>
          <div v-if="msg.role === 'user'" class="message-content__text">{{ msg.text }}</div>
        </div>
        <div class="operation-area">
          <div class="copy-icon" v-if="msg.end && msg.role === 'ai'" @click="doCopy(msg.text)">
            <SvgIcon name="copy" color="#ACACAC" width="18px" height="18px" />
          </div>
        </div>
        <div
          v-if="msg.role === 'ai' && (msg.showRecommend || (msg?.recommendList && msg?.recommendList.length && messages.length - 1 <= index))"
          style="width: 100%;">
          <RandomRecommend :recommendList="msg?.recommendList" />
        </div>
      </div>
    </div>
  </van-list>
</template>
<script lang="ts" setup>
import { inject, onMounted } from 'vue';
import { useChatStore } from '@/store/chatStore';
import LinkSheet from './LinkSheets.vue';
import ThinkCollaspe from './DeepCollaspe.vue';
import ImgLoading from './loading.vue';
import { storeToRefs } from 'pinia';
import RandomRecommend from './RandomRecommend.vue';
import { doCopy } from '@/utils/doCopy'
import { defineAsyncComponent } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
const VueShowdown = defineAsyncComponent(() =>
  import('vue-showdown').then((module) => module.VueShowdown)
);


const store = useChatStore();

const { messages } = storeToRefs(store);

const { checkScroll } = store;

const referenceExtension = () => {
  return [{
    type: 'lang',
    regex: /\[(\d+)\](\s*\[(\d+)\])*/g,  // 匹配 [1]、[2] 这样的标记
    replace: (match) => {
      console.log('match====>', match)
      const reg = /(\d+)/g
      const arr = match.match(reg)
      let numString = arr.join(',');
      const templateString = arr.map((num) => {
        return `<span class="link-tag">${num}</span>`
      }).join('')
      return ` <span data-v=${numString} class="link-tag-container">${templateString}</span>`
    }
  }]
}


const hideExtension = () =>  [{
  type: 'lang',
  regex: /\[(ad[^\]]*)/g,
  replace: (match) => {
    console.log('hideAExtension=====>111', match)
    return ''; // 直接替换为空，不显示
  }
}]


const triggerParent = inject('parentMethod');

const triggerOnlineShow = (msg) => {
  triggerParent(msg.onlineList)
}

onMounted(() => {
  const scrollBox = document.getElementById('chat-container-box');
  scrollBox.addEventListener('scroll', checkScroll);
  checkScroll()

  document.addEventListener("click", (event) => {
    const linkTag = event.target.closest(".link-tag-container");
    if (!linkTag) return;
    const messageContent = linkTag.closest(".message-content-ai");
    if (!messageContent) return;
    const dataMsgId = messageContent.getAttribute("data-msg");
    const dataV = linkTag.getAttribute("data-v");
    if (!dataMsgId || !dataV) return;
    messages.value.forEach((msg) => {
      if (msg.id + "" === dataMsgId + "") {
        const showList = msg?.onlineList?.filter((list) =>
          dataV.split(",").includes(list.Index + "")
        );
        triggerParent(showList);
      }
    });

  });


})

</script>
<style lang="scss">
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  }
  50% {
    box-shadow: 0 4px 25px rgba(99, 102, 241, 0.5);
  }
}

.chat-container {
  width: 100%;
  height: 100%;
  margin: auto;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  display: flex;
  flex-direction: column;

  .van-icon-arrow-left {
    color: #1e293b !important;
  }

  .link-tag {
    margin: 0 2px;
    color: #475569;
    text-align: justify;
    font-family: 'PingFang SC';
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 18px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: inline-block;
    text-align: center;
    background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
    color: #475569;
    border: 1px solid #cbd5e1;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
    }
  }
}

.message-content {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 10px 12px;
  color: #fff;
  display: flex;
  align-items: center;
  max-width: calc(100vw - 80px);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.3);

  .ai-loading {
    width: 20px;
    height: 20px;
    animation: rotate360 1s linear infinite;
  }

  p {
    margin-top: 0;
    padding: 0;
  }
}

.message-content-user {
  display: flex;
  align-self: flex-end;
  border-top-right-radius: 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  .message-content__text {
    font-size: 15px;
    line-height: 21.75px;
    white-space: pre-wrap;
    position: relative;
    z-index: 1;
  }
}

.message-content-ai {
  display: flex;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(15px);
  color: #475569;
  position: relative;
  align-self: flex-start;
  flex-direction: column;
  align-items: flex-start;
  border-top-left-radius: 0;
  max-width: unset;
  padding: 0;
  width: calc(100vw - 30px);
  gap: 0;
  border: 1px solid rgba(203, 213, 225, 0.6);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  .aigc-hint {
    position: absolute;
    bottom: 4px;
    right: 10px;
    font-size: 8px;
    line-height: 10px;
    color: #c6cad3;
  }

  .van-cell__right-icon {
    color: #737373;
    position: relative;
    // top: 4px;
  }
}

.message {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 25px;
  animation: fadeInUp 0.5s ease-out;

  .operation-area {
    width: 100%;
    display: flex;
    padding: 0 4px;

    .copy-icon {
      padding: 4px 0;
      display: flex;
      align-items: center;
      opacity: 0.7;
      transition: all 0.3s ease;
      border-radius: 6px;
      padding: 6px;

      &:hover {
        opacity: 1;
        background: rgba(99, 102, 241, 0.1);
        transform: scale(1.1);
      }
    }
  }

  .recommend-hint {
    margin-bottom: 16px;
  }


  .recommend-list-item {
    margin-top: 0;
    font-size: 13px;
    line-height: 16px;
    margin-bottom: 14px;

    span {
      display: block;
      background: rgba(248, 250, 252, 0.9);
      backdrop-filter: blur(10px);
      color: #475569;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(203, 213, 225, 0.6);
      width: fit-content;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: #6366f1;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
      }
    }
  }

  &.welcome {
    padding: 0 15px;
    width: 100vw;

    .message-content {
      background: rgba(248, 250, 252, 0.8);
      border: 1px solid rgba(203, 213, 225, 0.6);
    }

    h3 {
      margin: 0;
      margin-bottom: 14px;
      font-weight: 500;
      font-size: 20px;
    }

    p {
      font-size: 14px;
      line-height: 20px;
      font-weight: 400;
      margin: 0;
    }
  }
}

.user {
  align-self: flex-end;
  flex-direction: row-reverse;
  margin-right: 20px;
}

.ai {
  align-self: flex-start;
  width: 100%;
  padding: 0 18px 0 19px;

  h1,
  h2,
  h3,
  h4,
  h5 {
    margin: 4px 0;
    font-size: 16px;
    line-height: 20px;
    margin: 17px 0 12px;
    color: #1e293b;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
  }

  p,
  li {
    line-height: 25px;
    margin-bottom: 5px;
    font-size: 15px;
    color: #475569;
  }

  table {
    width: calc(100vw - 37px);
    overflow: scroll;
  }

  pre {
    overflow: scroll;
    width: calc(100vw - 37px);
  }

  code {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    color: #1e293b;
    border-radius: 4px;
    padding: 2px 4px;
    border: 1px solid #94a3b8;
  }

  strong {
    font-weight: bold;
  }

  .ads-content {
    color: #6366f1;
    border-bottom: 1px dashed #6366f1;
    line-height: 1;
    padding-bottom: 1px;
    position: relative;
  }

  .ads-loaded {
    color: #8b5cf6;
    border-bottom: 1px dashed #8b5cf6;
    line-height: 1;
    padding-bottom: 1px;
    position: relative;
  }

  .ads-loaded::after {
    content: '';
    position: absolute;
    top: -8px;
    right: -8px;
    width: 8px;
    height: 8px;
    background-image: url('@/assets/icons/export.svg');
    background-size: contain;
    background-repeat: no-repeat;
    pointer-events: none;
    /* 角标不会挡住点击 */
  }
}
</style>

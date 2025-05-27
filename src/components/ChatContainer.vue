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
                flavor="github" :extensions="[referenceExtension, adsExtension, hideExtension]" :options="{ emoji: true }"
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
import { jumpToAds, apperLog, getAdsExtContent ,cachedAdsMap, showTriggerMap} from '@/utils/helper';
const VueShowdown = defineAsyncComponent(() =>
  import('vue-showdown').then((module) => module.VueShowdown)
);


const store = useChatStore();

const { messages, sessionId } = storeToRefs(store);

const { checkScroll, tracker } = store;

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

const adsExtension = () => {
  return [{
      type: 'lang',
      regex: /\[ads:([^:]+?):(.*?)\]/g,
      replace: (match) => {
        const regex = /\[ads:([^:]+?):(.*?)\]/g;
        let result = regex.exec(match)
        const content = result[1]
        const id = `${result[1]}_${result[2]}`;
        const cacheData = JSON.stringify(cachedAdsMap[id]) ;
        if(cachedAdsMap[id]) { 
          if(!showTriggerMap[id]){
            let parsedData
            try{
              parsedData = JSON.parse(decodeURIComponent(cachedAdsMap[id]));
            } catch(e) {
              console.error('parseError')
              console.error(e)
            }
            showTriggerMap[id] = true;
            apperLog(parsedData);
            const adsExtContent = getAdsExtContent({
              aderData: parsedData,
              keyword: content
            })

          }
          return `<span id=${id} class="ads-content ads-loaded" data-ads=${cacheData} >${content}</span>`
        }
        return `<span id=${id} class="ads-content">${content}</span>`
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

  document.addEventListener("click", (event) => {
    // 获取点击ads-content 的data-ads 内容 ，然后触发 jump方法
    const adsEl = event.target.closest(".ads-content");
    if (!adsEl) return;
    const keyword = adsEl?.innerText;
    // console.log('adsEl====>', keyword)
    
    const adsData = adsEl.getAttribute("data-ads");
    if (!adsData) return;
    try {
      let parsedData = JSON.parse(decodeURIComponent(adsData));
      jumpToAds(parsedData);
      let extContent = getAdsExtContent({
        aderData: parsedData,
        keyword: keyword
  
      });
      const messageContent = adsEl.closest(".message-content-ai");
      if (!messageContent) return;
      const dataMsgId = messageContent.getAttribute("data-msg");
      // console.log('tracker=====>extContent', extContent)
 
      // console.log('adsData=====>parsedData', parsedData)
    } catch (e) {
      console.error('adsData=====>', adsData)
      console.error('Error parsing adsData:', e);
    }
  });
})

</script>
<style lang="scss">
.chat-container {
  width: 100%;
  height: 100%;
  margin: auto;
  background-color: #f4f6fa;
  display: flex;
  flex-direction: column;

  .van-icon-arrow-left {
    color: #000 !important;
  }

  .link-tag {
    margin: 0 2px;
    color: #666;
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
    background-color: #e7e7e7;
  }
}

.message-content {
  background-color: #0285f0;
  padding: 10px 12px;
  color: #fff;
  display: flex;
  // gap: 8px;
  align-items: center;
  max-width: calc(100vw - 80px);
  border-radius: 8px;

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

  .message-content__text {
    font-size: 15px;
    line-height: 21.75px;
    white-space: pre-wrap;
  }
}

.message-content-ai {
  display: flex;
  // background-color: #ffffff;
  background: transparent;
  background-color: #f4f6fa;
  color: #333333;
  position: relative;
  align-self: flex-start;
  flex-direction: column;
  align-items: flex-start;
  border-top-left-radius: 0;
  max-width: unset;
  padding: 0;
  width: calc(100vw - 30px);
  gap: 0;

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

  .operation-area {
    width: 100%;
    display: flex;
    padding: 0 4px;

    .copy-icon {
      padding: 4px 0;
      display: flex;
      align-items: center;
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
      background-color: #e6e9ef;
      padding: 10px 12px;
      border-radius: 6px;
      width: fit-content;
    }
  }

  &.welcome {
    padding: 0 15px;
    width: 100vw;

    .message-content {}

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
  }

  p,
  li {
    line-height: 25px;
    margin-bottom: 5px;
    font-size: 15px;
    color: #1a1a1a;
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
    background: #555;
    color: white;
  }

  strong {
    font-weight: bold;
  }

  .ads-content {
    // color: #0285F0;
    // border-bottom: 1px dashed #0285F0;
    // line-height: 1;
    // padding-bottom: 1px;
    // position: relative;
  }

  .ads-loaded {
    color: #0285F0;
    border-bottom: 1px dashed #0285F0;
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
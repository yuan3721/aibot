<template>
  <!-- 输入框 -->

  <van-cell-group class="input-container">
    <slot></slot>
    <div class="input-wrapper">
<van-field ref="userInputRef"  id="usercontent"  v-model="userInput"  class="user-input" rows="1" autosize  enterkeyhint="return" type="textarea"
    v-on:focus="focusScroll" v-on:blur="inputBlur" />
     <label for="usercontent" v-show="!userInput.length">{{ placeholder }}</label>
    </div>

    <div class="user-operation">
      <div class="extra-btns">
        <div class="seach-button" :class="{ enable: enableR1 }"
          :style="{
            color: enableR1 ? '#6366f1' : '#475569',
            background: enableR1 ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' : 'rgba(248, 250, 252, 0.9)',
            borderColor: enableR1 ? '#6366f1' : 'rgba(203, 213, 225, 0.8)'
          }"
          type="primary" plain round @click="selectR1">
          <SvgIcon name="r12" :color="enableR1 ? '#6366f1' : '#475569'" style="margin-right: 6px;" />
          深度思考（R1）
        </div>

        <div class="seach-button" :class="{ enable: enableOnline }"
          :style="{
            color: enableOnline ? '#6366f1' : '#475569',
            background: enableOnline ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' : 'rgba(248, 250, 252, 0.9)',
            borderColor: enableOnline ? '#6366f1' : 'rgba(203, 213, 225, 0.8)'
          }"
          type="primary" plain round @click="selectOnline">
          <SvgIcon name="link" :color="enableOnline ? '#6366f1' : '#475569'" style="margin-right: 6px;" />
          联网搜索
        </div>

      </div>
      <van-button v-if="!isTyping" class="send-btn" :class="{ disabled: !isTyping && !userInput?.trim() }" type="primary"
        round @click="send">
        <SvgIcon name="send" color="#fff" width="10px" height="12px" />
      </van-button>

      <van-button v-else class="send-btn" :class="{ disabled: !isTyping && !userInput?.trim() }"
        type="primary" round @click="stopGenerater(false)">
        <SvgIcon name="pause" width="30" height="30" />
      </van-button>
    </div>
  </van-cell-group>

</template>
<script setup lang="ts">
import { useChatStore } from '@/store/chatStore';
import { storeToRefs } from 'pinia';
import SvgIcon from '@/components/SvgIcon.vue';
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  showAds: {
    type: Boolean,
    default: false
  },
})

const userInputRef = ref(null); // 定义 ref
const adsPadding = ref(true);
const store = useChatStore();
const { isTyping, enableOnline, enableR1 , userInput} = storeToRefs(store) ;
const {  selectOnline, selectR1, setInput,stopGenerater,sendMessage } = store;
const keyboardHeight = ref(0);
const placeholder = computed(() => {
  if (enableR1.value &&  enableOnline.value) {
    return '结合全网信息，深度解析问题'
  } else if(enableR1.value) {
    return '展示思考过程，回答更全面'
  } else if(enableOnline.value) {
    return '实时检索全网最新动态'
  } else {
    return '和我说点什么'
  }
})



const send = () => {
  console.log('send', userInput)
  let inputvalue = userInput?.value.trim()
  if (inputvalue) {
    sendMessage(inputvalue);
  }
}

const focusScroll = () => {
  adsPadding.value = false;
  const chatContainer = document.getElementById('chat-container-box');
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

const inputBlur = () => {
    setTimeout(() => {
      adsPadding.value = true;
    }, 50);
}

onMounted(() => {

  window?.tutu?.feature.social.listenKeyboard((res: any) => {
    console.log('键盘事件', res);
    keyboardHeight.value = res.data.height / (res.data.density);
    if (!res.data.open && userInputRef.value) {
      if (userInputRef.value) {
        userInputRef.value.blur(); // 触发 blur 事件
      }
    }
  });
})

</script>

<style lang="scss">
#chat-container-box {
  padding-bottom: 0;
  // padding-top: 0
}

.input-container {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(226, 232, 240, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
  padding: 14px 18px 20px;
  box-shadow: 0px -10px 40px rgba(0, 0, 0, 0.1);
  color: #64748b;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(203, 213, 225, 0.6);
  border-bottom: none;

  .input-wrapper{
    position: relative;
    label {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
      pointer-events: none;
      font-size: 15px;
    }
  }

  .new-session {
    height: 35px;
    width: 35px;
    // background: #fff;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50px;
    color: rgba(0, 0, 0, 0.8);
    // border: 0.5px solid #E6E6E6;
  }

  .van-button__text {
    display: flex;
    align-items: center;

    svg {
      margin-right: 5px;
    }
  }

  .user-input {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(203, 213, 225, 0.8);
    border-radius: 12px;
    font-size: 15px;
    max-height: 66px;
    line-height: 22px;
    color: #1e293b;
    padding: 12px;
    overflow-y: auto;
    transition: all 0.3s ease;

    &:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    &::placeholder {
      color: #64748b !important;
    }

    &::after {
      border-bottom: 0px solid var(--van-cell-border-color);
    }

    .van-field__value {
      padding: 0;
      color: #1e293b;
    }

    .van-field__control::placeholder {
      color: #64748b;
    }
  }

  .user-operation {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .extra-btns {
      display: flex;
      align-items: center;
    }
  }

  .van-button {
    border: 1px solid rgba(203, 213, 225, 0.8);
    border-radius: 1000px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    height: 30px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(248, 250, 252, 0.95);
      border-color: #6366f1;
    }

    &.send-btn {
      width: 30px;
      height: 30px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);

      svg {
        margin-right: 0;
      }

      &.disabled {
        background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &:hover:not(.disabled) {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      }
    }

    &.van-enable {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border-color: #6366f1;
      color: #6366f1;
    }
  }

  .seach-button {
    display: flex;
    padding: 8px 16px;
    align-items: center;
    border-radius: 20px;
    border: 1px solid rgba(71, 85, 105, 0.5);
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(15px);
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
    color: #e2e8f0;
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
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    &:hover {
      background: rgba(99, 102, 241, 0.2);
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

    &.enable {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
      border-color: #6366f1;
      color: #a5b4fc;
      box-shadow: 0px 4px 20px rgba(99, 102, 241, 0.3);
    }
  }
}
</style>

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
        <div class="seach-button" :class="{ enable: enableR1 }" :style="{ color: enableR1 ? '#0285F0' : '#333' }"
          type="primary" plain round @click="selectR1">
          <SvgIcon name="r12" :color="enableR1 ? '#0285F0' : '#333'" style="margin-right: 6px;" />
          深度思考（R1）
        </div>

        <div class="seach-button" :class="{ enable: enableOnline }" :style="{ color: enableOnline ? '#0285F0' : '#333' }"
          type="primary" plain round @click="selectOnline">
          <SvgIcon name="link" :color="enableOnline ? '#0285F0' : '#333'" style="margin-right: 6px;" />
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
  isBottomBar: {
    type: Boolean,
    default: false
  }
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
    return '和DeepSeek说点什么'
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
  background-color: white;
  // height: 108px;
  border-radius: 14px 14px 0 0;
  padding: 14px 18px 20px;
  // position: fixed;
  // bottom: 0;
  box-shadow: 0px -10px 40px 0px #e5eaf4;
  color: #888888;
  width: 100%;
  box-sizing: border-box;

  .input-wrapper{
    position: relative;
    label {
      position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  pointer-events: none;
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
    background-color: #fff;
    font-size: 15px;
    max-height: 66px;
    line-height: 22px;
    color: #333333;
    padding: 0;
    overflow-y: auto;
    border: none !important;
    box-shadow: none !important;
    &::placeholder {
      color: #888888 !important;
    }

    &::after {
      border-bottom: 0px solid var(--van-cell-border-color);
    }

    .van-field__value {
      // padding-top: 10px;
    }

    .van-field__control::placeholder {
      // padding-top: 10px;
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
    border: none;
    border-radius: 1000px;
    // border: 1px solid rgba(0, 0, 0, 0.05);
    background: #fff;
    height: 30px;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.05);

    &.send-btn {
      width: 30px;
      height: 30px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0285f0;

      svg {
        margin-right: 0;
      }

      &.disabled {
        background: #9dc0fa;
      }
    }

    &.enable {
      background: #dff1ff;
    }
  }
}
</style>
<template>
  <p></p>
  <div
    v-if="showDel"
    ref="popover"
    class="history-del-popover"
    :style="{ top: position.y + 'px', left: position.x + 'px' }"
    @click.stop
    @click="confirmDelete"
  >
    删除
  </div>
  <van-button block class="empty-history-hint__btn" color="#F8F8F8" type="default" @click="openNewSession">
    <slot name="icon">
      <SvgIcon name="newDialog" color="#222" width="26px" height="26px" />
    </slot>
    <slot>&nbsp;开启新对话</slot>
  </van-button>
  <div class="pop-list-container">
    <van-list v-if="Object.keys(chatGroups).length > 0">
      <van-cell-group v-for="chatGroupTag in Object.keys(chatGroups)" :key="chatGroupTag" :title="chatGroupTag">
        <van-cell v-for="chatItem in chatGroups[chatGroupTag]" :key="chatItem.id" class="chat-list__item"
          :title="chatItem.title" :class="{ active: chatItem.id === sessionId }"
          @touchstart="(e) => handleTouchStart(e, chatItem)" @touchend="handleTouchEnd"

          @click="handleCellClick(chatItem)">
        </van-cell>
      </van-cell-group>
    </van-list>
    <div v-else class="empty-history-hint">
      <div class="empty-history-hint__title">暂无对话</div>
      <div class="empty-history-hint__desc">
        你与 智能体 的对话
        <br />
        将展示在这里
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

import { ref, onMounted, onUnmounted} from 'vue';
import { useChatStore } from '@/store/chatStore';
import SvgIcon from '@/components/SvgIcon.vue';
import { storeToRefs } from 'pinia';
import { showConfirmDialog } from 'vant';
import 'vant/lib/dialog/style';
import { getAIDeepSeekDelSession } from '@/api/index';

const props = defineProps({
  show: Boolean,
  chatGroups: Object,
  hideRight: Function,
  refresh: Function
});

const store = useChatStore();

const showDel = ref(false)
const position = ref({
  x: 0,
  y: 0
})
const { sessionId } = storeToRefs(store);
const changeChat = (chatItem) => {
  props.hideRight();
  store.selectChat(chatItem);
  const chatContainer = document.getElementById('chat-container-box');
  chatContainer.scrollTop = 0;
};

const longPressTimer = ref<any>();
const longPressItem = ref<any>(null);

const handleTouchStart = (e, chatItem: any) => {
  longPressItem.value = chatItem;
  longPressTimer.value = setTimeout(() => {
    // 长按触发逻辑
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      // 当元素祖先的 transform 属性非 none 时，定位容器由视口改为该祖先。故此处减去13%，获取蒙层实际宽度
      const originWidth = document.body.clientWidth * 0.13;
      let left = touch.clientX
      console.log('left====>', left,  document.body.clientWidth)
      if(left + 200 > document.body.clientWidth) {
        left = left - originWidth - 120
      } else {
        left = left - originWidth
      }
      position.value = { x: left, y: touch.clientY - 5};
      showDel.value = true;
    }
  }, 500); // 500ms长按时间
};

const handleTouchEnd = (e) => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = undefined;
  }
};

const handleCellClick = (chatItem: any) => {
  if (!longPressTimer.value) {
    // 没有长按定时器才执行点击
    changeChat(chatItem);
  }
};

const openNewSession = () => {
  props.hideRight();
  store.openNewSession();
};

const closePopover = () => {
  showDel.value = false;
  clearTimeout(longPressTimer.value)
}

const confirmDelete = () => {
  showConfirmDialog({
    title: '确认删除',
    message: '是否确认删除该对话，删除后无法恢复',
    // theme: 'round-button',
    confirmButtonText: '删除',
    confirmButtonColor: '#FA5151',
  }).then(() => {
    const delSessionId = longPressItem.value?.id
    if(delSessionId){
       getAIDeepSeekDelSession({
        sessionId: delSessionId
      }).then((res) => {
        console.log('res====>',delSessionId,sessionId.value)
        props.refresh()
        if(`${delSessionId}` === sessionId.value) {
          store.openNewSession()
        }
      })
    }
    // console.log('longPressItem.value =====> ',longPressItem.value )
  })
}

onMounted(() => {
  document.addEventListener('click', closePopover);
  document.addEventListener('touchmove', closePopover);
});

onUnmounted(() => {
  document.removeEventListener('click', closePopover);
  document.removeEventListener('touchmove', closePopover);
});
</script>

<style lang="scss">
.pop-list-container {
  -webkit-touch-callout: none;
  touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
.history-del-popover {
  position: absolute;
  z-index: 3;
  border-radius: 12px;
  background: #FFF;
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.10);
  // width: 116px;
  // height: 48px;
  color: #FA5151;
  // font-family: "PingFang SC";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  padding: 16px 72px 16px 16px;
}

.van-dialog__message--has-title{
  padding-bottom: 6px;
}

</style>

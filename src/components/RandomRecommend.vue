<template>
  <div class="split-line"></div>
  <div class="recommend">
    <div class="recommend-hint">
      <div>  {{isDefault ? '你可以这样问' : '继续提问'}}
      </div>
      <div class="recommend-hint__change" @click="getNewItems" v-if="isDefault">
        <SvgIcon name="change2" color="#96a1a8" width="14px" height="14px" />
        <div>换一批</div>
      </div>
    </div>
    <div class="recommend-list">
      <!-- <p>{{ displayedItems }}</p> -->
      <div class="recommend-list-item" v-for="(item,id) in displayedItems" :key="id" >
        <span @click="sendRecommendMessage(item.question)">{{ item.question }}</span>
        <!-- <SvgIcon name="arrow" color="#ACACAC" width="6px" height="10px" /> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useChatStore } from '@/store/chatStore';
import { storeToRefs } from 'pinia';
import { recommendList as defaultRecommendList } from '@/utils/constants.js';
import SvgIcon from '@/components/SvgIcon.vue';
import { RecommendInfo } from '@/types/messages';

const shownItems = ref<RecommendInfo[]>([]);
const displayedItems = ref<RecommendInfo[]>([]);

const props = defineProps<{
  recommendList: {
    type: RecommendInfo[];
    defautl: [];
  },
}>();

const store = useChatStore();

const { sendRecommendMessage, tracker } = store;

const createItemFetcher = (items) => {
  let index = 0; // 当前索引
  return function getNextItems() {
    if (index >= items.length) {
      index = 0; // 重新从头开始
    }
    const nextItems = items.slice(index, index + 2);
    index += 2;
    return nextItems;
  };
}

let getNextItems = null;

const recommendList = props?.recommendList || defaultRecommendList;

const isDefault = computed(() => {
  return !(props?.recommendList && props.recommendList?.length);
})

const getNewItems = () => {
  const remaining = recommendList.filter(item => !shownItems.value.includes(item));
  if (remaining.length >= 3) {
    // 仍然有未展示过的元素，选两个
    const newItems = remaining.sort(() => 0.5 - Math.random()).slice(0, 3);
    newItems.forEach(item => shownItems.value.push(item));
    displayedItems.value = newItems;
  } else {
    if (!getNextItems) {
      getNextItems = createItemFetcher(shownItems.value);
    }
    displayedItems.value = getNextItems()
  }

  displayedItems.value.map(item => {
    // const qId = recommendList.indexOf(item)
    tracker('ai_chatbot_h5_suggest_show', {
      questionId: item.id + ''
    })
  })
};

onMounted(() => {
  if(isDefault.value) {
    getNewItems();
  } else {
    displayedItems.value = props?.recommendList.map((item,index) => {
      return {
        question: item,
        id: index
      }
    });
  }
});

watch(() => props.recommendList, (newList) => {
  displayedItems.value = newList.map((item, index) => {
    return {
      question: item,
      id: index
    }
  });
}, { deep: true });

</script>
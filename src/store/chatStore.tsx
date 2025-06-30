import { defineStore } from 'pinia';
import { ref, nextTick, computed } from 'vue';
import dayjs from 'dayjs';
import { Message, RecommendInfo } from '@/types/messages';
import { extractErrorInfo, decoratorFetch, parseContent, getConfig, throttle, generateUniqueId, parseAdsText, isHarmonyOS, shouldForceLogin } from '@/utils/helper';
import { getPushHideContent, getPushContent, safeAssembleTemplate } from '@/utils/pushhelpers.js';
import {
  getAIDeepSeekSendMessage,
  getAIDeepSeekRefreshMessage,
  getAIDeepSeekNewSession,
  getAIDeepSeekMessageOnlineInfos,
  getAIDeepSeekMessages,
} from '@/api/tutuApiWiFi/index.api';
import { recommendList } from '@/utils/constants';
import { showToast } from 'vant';
import { getUrlParams } from '@/utils/getParams.js';

const welComeText =
  '### Hi～我是小墨\n\n你身边的智能助手，可以为你答疑解惑、尽情创作，快来点击以下任一功能体验吧～';

const pushKey = getUrlParams('pushkey') || '';
const pushenableR1 = getUrlParams('r1') || '';
const pushenableOnline = getUrlParams('online') || '';
const scene = getUrlParams('scene') || '';
const promptFromUrl = getUrlParams('prompt') || '';

const enableAds = getUrlParams('ads') || false;

let canLoginSkipFirstMsg = false;

let fetchTimeout: ReturnType<typeof setTimeout> | null = null;
let textTimout: ReturnType<typeof setTimeout> | null = null;
// let typingFrame: number | null = null;

const linkMap = {};
const uuid = generateUniqueId()

const getLinkMapFromMsgId = (msgId, content, sessionId) => {
  if (!linkMap[msgId]) {
    return decoratedGetAIDeepSeekMessageOnlineInfos({
      msgId,
      sessionId,
     })
      .then((res) => {
        if (content) {
          // 如果content有值，认为已经结束了
          linkMap[msgId] = res?.infos || [];
        }
        return res.infos || [];
      })
      .catch((e) => {
        return null;
      });
  } else {
    return Promise.resolve(linkMap[msgId]); // 统一返回 Promise
  }
};

/**
 * TODO: 通过ai请求获取消息
 */
const decoratedGetAIDeepSeekSendMessage = decoratorFetch(getAIDeepSeekSendMessage);
const decoratedGetAIDeepSeekRefreshMessage = decoratorFetch(getAIDeepSeekRefreshMessage, 5);
const decoratedGetAIDeepSeekNewSession = decoratorFetch(getAIDeepSeekNewSession);
const decoratedGetAIDeepSeekMessageOnlineInfos = decoratorFetch(getAIDeepSeekMessageOnlineInfos);
const decoratedGetAIDeepSeekMessages = decoratorFetch(getAIDeepSeekMessages);

export const useChatStore = defineStore('chat', () => {
  const isTyping = ref(false);
  const userInput = ref('');
  const sessionId = ref('');
  const isTypingMsgId = ref('');
  const enableR1 = ref(false);
  const enableOnline = ref(false);
  const enableAutoScroll = ref(false);
  const fullText = ref('');
  const fullReasoning = ref('');
  const stopLoading = ref(false);
  const progress = ref(0);
  // const sentCount = ref(0); // 打点发消息计数

  // const isLogin = ref(false);

  const messages = ref<Message[]>([
    { id: 0, role: 'ai', text: welComeText, showRecommend: true },
    // ...other messages...
  ]);

  const setInput = (input: string) => {
    userInput.value = input;
  };

  const removeLastMessage = () => {
    messages.value.pop();
  };

  const removeWelcome = () => {
    messages.value = messages.value.filter((msg) => msg.text !== welComeText);
  };

  const getModeValue = () => {
    const enableR1Value = enableR1.value ? 1 : 0;
    const enableOnlineValue = enableOnline.value ? 2 : 0;
    let mode = enableR1Value + enableOnlineValue;
    return mode
  }

  let tabSource = ref('')
  const modifyTrackerSource = (source) => {
      tabSource.value = source
  };



  const setPrompt = (userInput, promptInput) => {
    const weekdayMap = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const date = dayjs().format('YYYY年M月D日');
    const time = dayjs().format('HH时mm分');
    const weekday = weekdayMap[dayjs().day()];
    const userInputParsed = safeAssembleTemplate(userInput, { date, weekday, time })
    return {
      userInput: userInputParsed,
      promptInput: safeAssembleTemplate(promptInput,
        { date, weekday,time, userInput: userInputParsed }),
    }
  }

  const getSceneInput = async (scene, inputFromUrl?) => {
    const config = await getConfig();
    const sceneMap = config.scene;
    const warpMessage = sceneMap[scene] || {};

    if (warpMessage) {
      const mode = +warpMessage.mode || 0;
      enableR1.value = mode === 1 || mode === 3;
      enableOnline.value = mode === 2 || mode === 3;
      const { userInput: parsedInput, promptInput } = setPrompt(inputFromUrl || warpMessage.userInput, warpMessage.firstPrompt);
      return {
        promptInput : promptInput,
        userInput: parsedInput
      }
    }
    return {};
  };

  const handleAIRequest = async (content: string, withPrompt?: string) => {
    let depth = enableR1.value;
    let internet = enableOnline.value;

    if (!sessionId.value) {
      const newSessionId = await createNewSession();
      if (!newSessionId) return;
      sessionId.value = newSessionId;

      if (!fromPush) {
        const { userInput: parsedInput, promptInput } = await getPromptContent(content);
        // console.log
        content = parsedInput;
        withPrompt = promptInput;
      }
    }

    const request = createAIRequest(content, withPrompt, depth, internet);
    const result = await sendAIRequest(request);
    if (!result) return false;

    // sentCount.value += 1; // 计数+1;

    const msgId = result.resMsgId;
    if (!msgId) return false;

    removeWelcome();
    userInput.value = "";
    isTyping.value = true;
    isTypingMsgId.value = msgId;

    messages.value.push({ id: msgId, role: 'ai', text: '', reasoning: '', online: false });
    playMessage(msgId, sessionId.value);
    return true;
  };

  const createNewSession = async () => {
    try {
      const newSessionResult = await decoratedGetAIDeepSeekNewSession();
      return newSessionResult?.session?.id;
    } catch (e) {
      showToast('网络异常，请稍后再试。');
      messages.value.pop();
      console.error(e);
      return null;
    }
  };

  const getPromptContent = async (content) => {
    const config = await getConfig();
    const commonPrompt = config.commonPrompt;
    const promptContent = commonPrompt[getModeValue()] || {};
    const prompt = promptContent.firstPrompt || '';
    return setPrompt(content, prompt);
  };

  const createAIRequest = (content, withPrompt, depth, internet) => ({
    sessionId: sessionId.value,
    content,
    feature: !withPrompt,
    aiContent: withPrompt || content,
    depth,
    internet,
  });

  const sendAIRequest = async (request) => {
    try {
      return await decoratedGetAIDeepSeekSendMessage(request);
    } catch (e) {
      isTyping.value = false
      const { code, message } = extractErrorInfo(e?.data?.code?.message);
      if (+code === -112) {
        showToast('这条消息不是很合适，试试换一个问题吧。');
      } else {
        showToast('发送消息失败');
      }

      if (sessionId.value === request.sessionId) {
        removeLastMessage();
        userInput.value = request.content;
      }
      return null;
    }
  };


  let hasSkippedFirstLoginPrompt = false;

  // const decorateLogin = (action) => {
  //   return async function (...args) {
  //     const config = await getConfig();  // TODO: getConfig
  //     let canLoginSkipFirstMsg = config.canLoginSkipFirstMsg || false;
  //     let isAuditPass = window?.tutu?.app?.isAuditPass;
  //     let auditForceLogin = false

  //     if (isAuditPass) {
  //       const resultData = await isAuditPass().catch((e) => {
  //         console.error(e)
  //         return { data: true, mock: true}
  //       })
  //       auditForceLogin = !resultData?.data; //resultData.data true 审核通过， false 审核中， 审核中强制登录
  //     }
  //     const needLogin = shouldForceLogin(config.forceLoginScene || []) || auditForceLogin || isHarmonyOS()

  //     if (!hasSkippedFirstLoginPrompt && canLoginSkipFirstMsg) {
  //       hasSkippedFirstLoginPrompt = true;
  //       return action(...args);
  //     }
  //     // await checkLoginHk().catch((e) => {
  //     //   console.error(e);
  //     // })
  //     // if (!isLogin.value && needLogin) {
  //     //   showToast('登录后，享智能助手免费服务');
  //     //   await needLoginHk({
  //     //     from: 'deepseek',
  //     //     source: 'deepseek'
  //     //   })
  //     }
  //     // return action(...args);
  //   };
  // }

  /**
   *
   * @param userInput 用户实际看到的内容
   * @param promptInput  包裹prompt 的内容 没有的时候， input就是message
   * @param ignoreContent  boolean 埋点的时候忽略 content
   * @returns
   */
  const sendMessageWithoutLogin = async (textInput?, promptInput?, ignoreContent?) => {
    if(!textInput) {
      return;
    }
    if (isTyping.value) {
      showToast('回答输出中，请稍后操作或点击停止回答');
      return;
    }
    isTyping.value = true;

    messages.value.push({ role: 'user', text: textInput });
    canLoginSkipFirstMsg = false;
    await handleAIRequest(textInput, promptInput);
  };
  const sendMessage = sendMessageWithoutLogin
  const typingSpeed = 45; // 控制打字速度 多少毫秒打印1个字;
  let typingFrame
  const startTyping = (index: number, onComplete?: () => void) => {
  clearTimeout(typingFrame!);
  if (!messages.value[index].typingIndex) {
    messages.value[index].typingIndex = 0;
  }
  const typeNextChar = () => {
    if (!messages.value[index]) {
      return;
    }
    let typingIndex = messages.value[index].typingIndex;
    if (!messages.value[index].displayedText) {
      messages.value[index].displayedText = '';
    }
    if (!messages.value[index].displayedReasoning) {
      messages.value[index].displayedReasoning = '';
    }
    if (fullReasoning.value && typingIndex < fullReasoning.value.length) {
      messages.value[index].displayedReasoning += fullReasoning.value[typingIndex] || '';
      messages.value[index].typingIndex = messages.value[index].typingIndex + 1;
      typingFrame = setTimeout(() => {
        requestAnimationFrame(() => {
          typeNextChar()
          throttleScrollToBottom()
        });
      }, typingSpeed)
    } else if (typingIndex < (fullReasoning.value ? fullReasoning.value.length : 0) + fullText.value.length) {
      messages.value[index].displayedText += fullText.value[typingIndex - (fullReasoning.value ? fullReasoning.value.length : 0)] || '';
      messages.value[index].typingIndex = messages.value[index].typingIndex + 1;
      typingFrame = setTimeout(() => {
        requestAnimationFrame(() => {
          typeNextChar()
          throttleScrollToBottom()
        });
      }, typingSpeed)
    } else {
      onComplete && onComplete();
    }
  };
  typeNextChar()
};

  const checkScroll = () => {
    const scrollBox = document.getElementById('chat-container-box');
    const scrollButton = document.getElementById('scroll-button');
    const scrolledToBottom =
      scrollBox.scrollHeight - scrollBox.scrollTop < scrollBox.clientHeight + 100;
    if (scrolledToBottom) {
      enableAutoScroll.value = true;
    }
    if (scrollButton) {
      scrollButton.style.display = scrolledToBottom ? 'none' : 'flex';
    }
  };

  const scrollToBottom = () => {
    const chatContainer = document.getElementById('chat-container-box');
    requestAnimationFrame(() => {
      if (typeof chatContainer.scrollTo === 'function') {
        // 现代浏览器支持 scrollTo
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight, //
          behavior: 'smooth', // 平滑滚动
        });
      } else {
        // 兼容不支持 scrollTo 的情况（如旧版浏览器）
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  };


  const throttleScrollToBottom = throttle(scrollToBottom, 1000);

  async function playMessage(msgId: number, sid: string, continueFlag?: boolean) {
    let firstResponse = true;
    let lastContent = null;

    const fetchMessage = async (msgId: number, sid: string) => {
      if (firstResponse) {

        firstResponse = false;
      }

      if (sid !== sessionId.value) {
        clearTimeout(fetchTimeout!);
        return;
      }

      try {
        const response = await fetchWithTimeout(msgId);
        handleFetchResponse(response, msgId, sid);
      } catch (e) {
        handleFetchError(e);
      }
    };

    const fetchWithTimeout = (msgId: number) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject({ code: 10001, message: '获取消息超时' });
        }, 20000);

        const request = { msgId, shutdown: false };
        decoratedGetAIDeepSeekRefreshMessage(request)
          .then((response) => {
            clearTimeout(timer);
            resolve(response);
          })
          .catch((error) => {
            clearTimeout(timer);
            reject(error);
          });
      });
    };

    const handleFetchResponse = async (response, msgId: number, sid: string) => {
      const { message: messageResult } = response;
      const { id, end, content, reasoning, online, code , adTasks, sender} = messageResult;
      const msgIndex = messages.value.findIndex((msg) => msg.id === id);

      if (sid !== sessionId.value) return;

      if (msgIndex !== -1) {
        updateMessage( {id, sender, msgIndex, content, reasoning, end, online, code, adTasks });
        enableAutoScroll.value && throttleScrollToBottom();

      } else {
        messages.value.push({ id: msgId, role: 'ai', text: content, reasoning, online });
        fullText.value = content;
        fullReasoning.value = reasoning;
      }

      await nextTick();
      enableAutoScroll.value && throttleScrollToBottom();

      if (end) {
        clearTimeout(textTimout!);
        textTimout = null;

        isTyping.value = false;
        return;
      }

      handleFetchTimeout(msgId, sid, reasoning, content);
    };

    const handleFetchError = (error) => {

      stopGenerater(true);

      messages.value.push({
        id: Math.random(),
        role: 'ai',
        text: '抱歉，服务异常, 我无法回答你的问题。',
        reasoning: '',
        end: true,
        online: false,
      });
    };

    const updateMessage = ({id, sender, msgIndex, content, reasoning, end, online, code, adTasks}) => {
      if (+code === -112) {
        // 风控拦截

        messages.value[msgIndex] = { ...messages.value[msgIndex],
          typingIndex: undefined,
          displayedText: '这个问题不是很适合回答，试试换一个问题吧。', text:  '这个问题不是很适合回答，试试换一个问题吧。',
          reasoning: '',
          end: true,
          online: false,
          onlineList: [],};
      } else if (+code !== 0) {

        messages.value[msgIndex] = { ...messages.value[msgIndex], displayedText: '', text: content || '服务器繁忙，请稍后再试吧。', reasoning, end, online };
      } else  {
        const { text, recommendList } = parseContent(content);
        console.log('sender====', sender)
        const showText =(sender === 'assistant' && enableAds) ?  parseAdsText({text, adTasks, sessionId: sessionId.value, msgId}) : text;
        fullText.value = showText;
        fullReasoning.value = reasoning;
        const onComplete = () => {
          messages.value[msgIndex].end = end;
          if(end){

            setTimeout(() => {
              messages.value[msgIndex].recommendList = recommendList;
              throttleScrollToBottom();
            }, 500)
          }
        }
        startTyping(msgIndex, onComplete);
        messages.value[msgIndex].text = `${text}`;
        messages.value[msgIndex].reasoning = `${reasoning}`;
        // messages.value[msgIndex].end = end;
        messages.value[msgIndex].online = online;

      }

      if (messages.value[msgIndex].online) {
        let onlineEnd = reasoning || content;
        getLinkMapFromMsgId(id, onlineEnd, sessionId.value)
          .then((infos) => {
            messages.value[msgIndex].onlineList = infos || [];
            messages.value[msgIndex].onlineCount = infos?.length || 0;
            messages.value[msgIndex].onlineEnd = !!onlineEnd;
          })
          .catch((e) => {
            console.error(e);
          });
      }
    };

    const handleFetchTimeout = (msgId, sid, reasoning, content) => {
      let bothContent = reasoning + content;
      if (lastContent !== bothContent) {
        lastContent = bothContent;
        clearTimeout(textTimout!);
        textTimout = null;
      }

      fetchTimeout = setTimeout(() => {
        fetchMessage(msgId, sid);
      }, 1000);

      if (!textTimout) {
        textTimout = setTimeout(() => {
          showToast('咨询人数过多，请耐心等待。');
        }, 20000);
      }
    };

    fetchMessage(msgId, sid);
  }

  const selectOnline = () => {
    enableOnline.value = !enableOnline.value;
  };

  const selectR1 = () => {
    enableR1.value = !enableR1.value;
  };

  const stopGenerater = (shutdown?) => {
    if (!isTypingMsgId.value || stopLoading.value) {
      return;
    }
    let userBreak = !shutdown;
    const request = { msgId: isTypingMsgId.value, shutdown: shutdown, break: userBreak };
    stopLoading.value = true;

    getAIDeepSeekRefreshMessage(request)
      .then((res) => {
        stopLoading.value = false;
        if (res) {
          isTyping.value = false;
          isTypingMsgId.value = '';
          showToast('停止成功');
        }
      })
      .catch((e) => {
        console.log(e);
        stopLoading.value = false;
        isTyping.value = false;
        showToast('停止失败');
      });
  };

  const selectChat = async (chat) => {
    clearTimeout(fetchTimeout);
    clearTimeout(textTimout);
    textTimout = null;
    sessionId.value = chat.id;

    try {
      const res = await decoratedGetAIDeepSeekMessages({ sessionId: chat.id, miniId: null });
      const historyMsg = res.messages.sort((a, b) => a.sendTick - b.sendTick);
      const historyResult = historyMsg.map((msg) => {
        let text = msg.content;
        if (msg.sender !== 'assistant') {
          text = text
            .replace('注意，最后在末尾加一句“----', '')
            .replace('可以告诉我你的具体出生日期，我来为你精准测算。”', '')
            .replace(/===[\s\S]*?===/g, '')
            .trim();
        }
        const { text: newText, recommendList } = parseContent(text);
        const showText = (msg.sender === 'assistant' && enableAds) ?  parseAdsText({text: newText, adTasks: msg.adTasks, sessionId: chat.id, msgId: msg.id}) : newText;
        return {
          role: msg.sender === 'assistant' ? 'ai' : 'user',
          text: showText,
          recommendList,
          reasoning: msg.reasoning,
          id: msg.id,
          end: msg.end,
          online: msg.online,
        };
      }).sort((a, b) => +a.id - +b.id);

      // const updatedHistory = await Promise.all(historyResult.map(async (history) => {
      //   if (history.online) {
      //     const onlineInfos = await getLinkMapFromMsgId(history.id, true);
      //     history.onlineList = onlineInfos || [];
      //     history.onlineCount = onlineInfos.length || 0;
      //     history.onlineEnd = true;
      //   }
      //   return history;
      // }));

      // messages.value = updatedHistory;
      if (!messages.value[messages.value.length - 1].end) {
        isTyping.value = true;
        playMessage(messages.value[messages.value.length - 1].id, sessionId.value, true);
      } else {
        isTyping.value = false;
      }
      setTimeout(checkScroll, 500);
    } catch (error) {
      console.error('Failed to select chat:', error);
    }
  };

  const chatTitle = computed(() => {
    return messages.value.filter((i) => i.role === 'user')[0]?.text || '新对话';
  });

  const openNewSession = () => {
    // TODO: LOGIN?
    userInput.value = '';

    clearTimeout(fetchTimeout);
    clearTimeout(textTimout);
    textTimout = null;
    // showRight.value = false
    sessionId.value = '';
    isTyping.value = false;
    // getNewItems()
    messages.value = [{ role: 'ai', text: welComeText, showRecommend: true }];
    setTimeout(() => {
      checkScroll();
    }, 500);
  };

  const sendRecommendMessageWithoutLogin = async (question: string) => {
    const qId = recommendList.find(item => item.question === question)?.id || null;

    if (isTyping.value) {
      showToast('回答输出中，请稍后操作或点击停止回答');
      return;
    }
    isTyping.value = true;

    if (qId > 26 ) {
      //!! 这里26 是因为前面有27个问题是不用联网的
      enableOnline.value = true;
    }

    messages.value.push({ role: 'user', text: question });
    await handleAIRequest(question); // TODO: 这里要看下怎么整
  };

  const sendRecommendMessage = sendRecommendMessageWithoutLogin




  return {
    messages,
    enableR1,
    enableOnline,
    isTyping,
    userInput,
    sessionId,
    isTypingMsgId,
    chatTitle,
    enableAutoScroll,
    progress,
    removeLastMessage,
    removeWelcome,
    sendMessage,
    selectOnline,
    selectR1,
    setInput,
    selectChat,
    openNewSession,
    sendRecommendMessage,
    checkScroll,
    scrollToBottom,
    stopGenerater,
    modifyTrackerSource,
    // handleLogin
    // sentCount
  };
});

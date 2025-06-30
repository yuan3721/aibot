import dayjs from "dayjs";
import { getAppType } from './apptype';

export const extractErrorInfo = (str) => {
    if (!str) return null;
    const match = str.match(/\((-?\d+)\)(.*)/);
    if (match) {
      const errorCode = match[1];  // 提取的错误码
      const message = match[2];    // 提取的错误信息
      return { code: errorCode || 0, message: message || '服务异常，请稍后再试' };
    } else {
      return { code: 0, message: str }
    }
  }

export const groupMessages = (msg) => {
    if(!msg || !msg.length) return {};
    const now = dayjs();
    const todayStart = now.startOf('day');
    const yesterdayStart = todayStart.subtract(1, 'day');
    const past7DaysStart = yesterdayStart.subtract(6, 'day');
    const past30DaysStart = past7DaysStart.subtract(23, 'day');

    const grouped = {
      今天: [],
      昨天: [],
      过去7天: [],
      过去30天: []
    };

    msg?.forEach(({ id, firstMsg, lastSendTick }) => {
      const messageTime = dayjs(lastSendTick);
      const title = firstMsg
      if (messageTime.isSameOrAfter(todayStart)) {
        grouped['今天'].push({ id, title, lastSendTick });
      } else if (messageTime.isSameOrAfter(yesterdayStart) && messageTime.isBefore(todayStart)) {
        grouped['昨天'].push({ id, title, lastSendTick });
      } else if (messageTime.isSameOrAfter(past7DaysStart) && messageTime.isBefore(yesterdayStart)) {
        grouped['过去7天'].push({ id, title, lastSendTick });
      } else if (messageTime.isSameOrAfter(past30DaysStart) && messageTime.isBefore(past7DaysStart)) {
        grouped['过去30天'].push({ id, title, lastSendTick });
      } else {
        const monthKey = messageTime.format('YYYY年M月');
        if (!grouped[monthKey]) {
          grouped[monthKey] = [];
        }
        grouped[monthKey].push({ id, title, lastSendTick });
      }
    });

    for (const key of Object.keys(grouped)) {
      if (!grouped[key]?.length) delete grouped[key]
    }

    return grouped;
  }

export function decoratorFetch(fn: Function, retries: number = 3, delay: number = 500) {
    return async function(...args: any[]) {
      try {
        // 尝试第一次调用
        return await fn(...args);
      } catch (error) {
        // 如果第一次失败，进行重试
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            // 如果重试失败，等待 500ms 后再重试
            await new Promise(resolve => setTimeout(resolve, delay));
            // 重试调用
            return await fn(...args);
          } catch (retryError) {
            if (attempt === retries) {
              throw retryError;
            }
          }
        }
      }
    };
  }

  /**
   *
   * @param content
   * @returns {
   *    text: '展示内容',
   *    recommendList: [],
   *    showType?: 1
   * }
   */
  export function parseContent(content) {
    const splitRegex = /【<推荐互动>】/g;
    let finalText
    const [text, recommend] = content.split(splitRegex).map(s => s.trim());
    const recommendList = recommend?.split('\n').map(s => s.replace(/^\d+\./g,'').trim()).filter(Boolean) ?? [];

    // 移除末尾可能出现的不完整的标识
    finalText = text.replace(/【\<推荐互动\>|【\<推荐互动|【\<推荐互动【|【\<推荐互|【\<推荐|【<推|【<|【$/g, "");

    return {
      text: finalText,
      recommendList: recommendList,
    }
  }

  export  const getConfig = async ()  => {
    // 如果缓存中已有配置，直接返回
    return {
      commonPrompt: '"你是一个精通各种问题，并且总能以最契合用户的方式进行回复的百晓生。\n\n现在是${date}${weekday}。\n\n现在，你需要根据用户的特征，与用户完成后续对话。你每次的回复要符合以下要求：\n1. 输出不能超过600字。\n2. 在每次回复的最后，都要以Markdown的分割线格式（四条短横线-）加上一级标题的格式添加对话引导，诱导用户继续对话（必须有分割线以及以及标题格式，禁止输出对话引导之外的内容！！！）。格式如下：\n    1. \\n\\n----\\n\\n# 一句具体的对话引导\n    2. 对话引导要委婉、口语化，就像两个人对话一样，你要让用户容易明白可以发什么内容；但是不能直接写用户问题，或出现任何类似“你可以这样问”的描述。例如，“可以告诉我你的具体出生日期，我来为你精准测算。”\n    3. 当完成对话引导之后，继续输出2条推荐互动，你必须站在用户的视角，推测他在看到回复后，最可能、最感兴趣追问的问题；或是针对对话引导问题的可能回复。内容必须以有序列表的格式跟在“【<推荐互动>】”之后，格式如下：\n    1. \\n\\n【<推荐互动>】\\n\\n1. 一句话的推荐互动1\\n\\n2. 一句话的推荐互动2\n\n你需要处理的第一个问题是：${userInput}。"',
    }
  }

  type ThrottleOptions = {
    leading?: boolean;  // 是否在开始时立即执行
    trailing?: boolean; // 是否在结束后额外执行一次
  };

  export function throttle<T extends (...args: any[]) => void>(
    fn: T,
    wait: number,
    options: ThrottleOptions = {}
  ) {
    let lastCallTime = 0;   // 上次执行的时间戳
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: any[] | null = null; // 记录最后一次参数
    let lastThis: any = null; // 记录 this

    const { leading = true, trailing = true } = options;

    function invoke() {
      lastCallTime = Date.now();
      fn.apply(lastThis, lastArgs!);
      lastArgs = lastThis = null;
    }

    function throttled(this: any, ...args: any[]) {
      const now = Date.now();
      const remainingTime = wait - (now - lastCallTime);

      lastArgs = args;
      lastThis = this;

      if (remainingTime <= 0) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        if (leading) invoke();
      } else if (!timeout && trailing) {
        timeout = setTimeout(() => {
          timeout = null;
          if (lastArgs) invoke();
        }, remainingTime);
      }
    }

    throttled.cancel = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastArgs = lastThis = null;
    };

    return throttled;
  }


/*
*生产32位随机ID【【【【 广告用 】】】】
*/
export const generateRandomId = () => {
  let id = ''
  const timestamp = new Date().getTime().toString(16)
  const randomNumbers = Math.random()
    .toString(16)
    .substring(2, 10)
  id = timestamp + randomNumbers
  while (id.length < 32) {
    id += Math.random()
      .toString(16)
      .substring(2)
  }
  return id.substring(0, 32)
}

export function generateUniqueId(length = 21) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsetLength = charset.length;

    let uniqueId = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charsetLength);
        uniqueId += charset[randomIndex];
    }

    return uniqueId;
}

export const cachedAdsMap = {};

export const showTriggerMap = {};

type AdTask = {
  uuid: string;
  origin: string;
  keywords: string[];
};

export const getSlotId = () => {
  const appType = getAppType();
  let slotId = ''
  if(appType === 'jswk') {
    // 极速版
    slotId = '58553'
  } else {
    // 主板
    slotId = '58552'
  }
  return slotId
}

export const getAdsExtContent = ({ aderData, keyword, requestId }) => {
  let slotId = getSlotId()

  return {
    keyword: keyword,
    slotId: slotId,
    originalRequestId: aderData?.request_id || requestId,
    sid: aderData?.sid,
    ecpm: aderData?.ecpm,
  }
}

/**
 *
 * @param text
 * @param adTasks  { uuid, origin: '', keywords: []}
 * @returns
 */
export const parseAdsText = ({text, adTasks, sessionId, msgId}) => {
  let newText = text;
  if(!adTasks || adTasks?.length === 0) {
    return newText;
  }
  // 这里文本渲染的时候让它能渲染成广告的形式
  adTasks.forEach((adsContent,index) => {
    let uuid = adsContent.uuid;
    const withAdsText = replaceKeywords(adsContent.origin, adsContent.keywords, uuid);
    newText = newText.replace(adsContent.origin, withAdsText);
    const keywords = adsContent.keywords;
    keywords.map((keyword)=> {
      let id = keyword + '_' +  uuid; //TODO: uid 为
      if(Object.keys(cachedAdsMap).indexOf(id) > -1){
        return
      }
      cachedAdsMap[id] = '';
    })
  })
  return newText
};

export const replaceKeywords = (origin, keywords, id) => {
  const sortedKeywords = keywords.slice().sort((a, b) => b.length - a.length);
  const usedKeywords = {};
  const placeholders = [];
  let result = origin;
  for (let i = 0; i < sortedKeywords.length; i++) {
    const content = sortedKeywords[i];
    if (usedKeywords[content]) continue;
    const escaped = content.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escaped);
    if (regex.test(result)) {
      const placeholder = `__PLACEHOLDER_${placeholders.length}__`;
      result = result.replace(regex, placeholder);
      placeholders.push({ placeholder, value: `[ads:${content}:${id}]` });
      usedKeywords[content] = true;
    }
  }
  // 最后统一替换占位符为最终内容
  for (const { placeholder, value } of placeholders) {
    result = result.replace(placeholder, value);
  }
  return result;
};

const waitForElement = (id, maxTries = 10, interval = 500) => {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      if (el) {
        clearInterval(timer);
        resolve(el);
      } else if (++tries >= maxTries) {
        clearInterval(timer);
        reject(new Error(`Element #${id} not found in time`));
      }
    }, interval);
  });
};

export const encodeForHtmlAttr = (obj) => {
  try {
    const jsonStr = JSON.stringify(obj)
    const encoded = encodeURIComponent(jsonStr)
    return encoded
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  } catch (e) {
    console.error('encodeForHtmlAttr error:', e)
    return ''
  }
}

// export const jumpToAds = MyComponent.handleAdClickandReport
// export const apperLog = MyComponent.onAppearReport

export const isHarmonyOS = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('harmony') || userAgent.includes('harmonyos');
}

export const isIOS = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod');
}

// 策略定义
const strategies = {
  harmony: isHarmonyOS,
  all: () => true,
  // 可继续扩展更多策略，如 Android: (ua) => /Android/i.test(ua)
};

// 主函数：传入 ua 和 config，返回是否强制登录
export const shouldForceLogin = (forceLoginScene?) => {
  return forceLoginScene?.some(scene => {
    let curScene = scene.toLowerCase() || ''
    const strategy = strategies[curScene];
    return strategy ? strategy(navigator.userAgent) : false;
  });
}

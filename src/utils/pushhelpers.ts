import dayjs from "dayjs";
export const pushMap = {
    2: '请用紫微斗数技巧逐步分析八字，分析我的一生运势，涵盖事业、婚姻、健康方面的关键时间节点、事件等，尽量简洁概括。并着重分析大运时机，能赚多少钱。特别分析2025年3月10日这周的运势，给出具体注意事项。',
    3: `请用紫微斗数技巧逐步分析八字，分析我的一生运势，涵盖事业、婚姻、健康方面的关键时间节点、事件等，尽量简洁概括。并着重分析大运时机，能赚多少钱。特别分析${dayjs().format('YYYY年M月D日')}这天的运势，给出具体注意事项。`,
    4: `请用紫微斗数技巧逐步分析八字，分析${dayjs().format('YYYY年M月D日')}这天的运势，你可以从三合原局入手，分析健康、事业、财富、姻缘四个方面。然后简洁概括一生运势，重点说一下大运时机，能赚多少钱。`
}

export const pushHideMap = {
    1: '仅在第一次回复的最后用这句话结尾：“----\n# 跟我说说你的生日，咱们可以详细聊聊你的个人命盘。”',
    2: '内容不超过600字；仅在第一次回复的最后用这句话结尾：“----\n# 跟我说说你的生日，咱们可以详细聊聊你的个人命盘。”',
    3: '内容不超过500字；仅在第一次回复的最后用这句话结尾：“----\n# 跟我说说你的生日，咱们可以详细聊聊你的个人命盘。”',
    4: '内容不超过400字；仅在第一次回复的最后用这句话结尾：“----\n# 跟我说说你的生日，咱们可以详细聊聊你的个人命盘。”',
    5: '内容不超过300字；仅在第一次回复的最后用这句话结尾：“----\n# 跟我说说你的生日，咱们可以详细聊聊你的个人命盘。”',
    6: '内容不超过200字；仅在第一次回复的最后用这句话结尾：“----\n# 跟我说说你的生日，咱们可以详细聊聊你的个人命盘。”',
    7: '内容不超过600字；在关键内容、建议等部分用Markdown的粗体格式；仅在第一次回复的最后用这句话结尾：“----\n# 跟我说说你的生日，咱们可以详细聊聊你的个人命盘。”'
}

export const getPushContent = (key) => {
    if(!pushMap[key]) {
        return '';
    }

    return pushMap[key];
}

export const getPushHideContent = (key) => {
    if(!pushHideMap[key]) {
        return '';
    }
    
    return pushHideMap[key];
}

export const safeAssembleTemplate = (content, params, defaultParams = {}) => {
    if(!content) return ''
    return content.replace(/\$\{(\w+)\}/g, (_, key) => {
      if (key in params) return params[key] ?? '';
      if (key in defaultParams) return defaultParams[key] ?? '';
      return '';
    });
  }
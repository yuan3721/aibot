export const getUrlParams = (key, href) => {
  let url = href || window.location.href
  const params = {};
  const queryString = url.split('?')[1]?.split('#')[0]; 
  if (queryString) {
      parseParams(queryString, params);
  }
  const hashString = url.split('#')[1]; 
  if (hashString) {
      parseParams(hashString, params);
  }
  return params[key] || undefined;
}

export const parseParams = (query, params) => {
  query.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (!key) return; // 避免 key 为空
      // 判断value是否是base64编码，如果是解码一下一下
      const basedValue = isBase64(value) ? checkAndDecodeBase64(value) : value;
      const decodedKey = decodeURIComponent(key);
      const decodedValue = basedValue ? decodeURIComponent(basedValue) : ''; // 处理无值参数

      if (params[decodedKey] === undefined) {
          params[decodedKey] = decodedValue;
      } else if (Array.isArray(params[decodedKey])) {
          params[decodedKey].push(decodedValue);
      } else {
          params[decodedKey] = [params[decodedKey], decodedValue]; // 处理同名参数
      }
  });
}

const isBase64 = (str) => {
  if (typeof str !== 'string' || str.length % 4 !== 0) {
    return false;
  }

  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  if (!base64Regex.test(str)) {
    return false;
  }

  try {
    return btoa(atob(str)) === str;
  } catch (e) {
    return false;
  }
};


const checkAndDecodeBase64 = (value) => {
  if (isBase64(value)) {
    return  decodeBase64(value); // 解码 Base64
  }
  return value; // 不是 Base64，则返回原值
};

  const decodeBase64 = (str) => {
    let code = '';
    try {
      code = decodeURIComponent(escape(atob(str)));
    } catch (e) {
      console.error('decodeBase64 error:', e);
      code = str;
    }
    return code;
  };
  

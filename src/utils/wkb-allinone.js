export const isTutu = navigator.userAgent.includes('TuTuBrowser');

function stringifyParams(val) {
  const data = {};
  Object.keys(val).map((res) => {
    if (typeof val[res] === 'number') {
      data[res] = `${val[res]}`;
    } else {
      data[res] = val[res];
    }
  });
  return data;
}



export const customFetch = ({ req, config, reqClass, resClass }) => {
  console.log('isTutu', isTutu);
  if (isTutu) {
    return new Promise((resolve, reject) => {
      tutuFetch(config, req && req.transReq === 0 ? req : (reqClass && new reqClass(req)) || {})
        .then((model) => {
          resolve(resClass ? new resClass(model) : null);
        })
        .catch((err) => {
          reject(err);
        });
    });
  } else {
    return Promise.resolve({})
  }
};

export const tutuFetch = (val, params) => {
  delete params['_'];
  console.log('tutuFetch', val, { ...params });
  try {
    return new Promise((resolve, reject) => {
      if (!val) {
        reject();
      }
      window.tutu.network
        .request({
          path: val,
          model: {
            ...params,
          },
        })
        .then((e) => {
          console.log('【响应数据】', val, e.data);
          const { code, model } = e?.data || {};
          if (code?.value == 0) {
            resolve(model);
          } else {
            if (code?.value == -259) {
            //   showFailToast('网络异常，请稍后重试');
            } else if (code?.message) {
              // showFailToast(code?.message);
            }
            reject(e);
          }
        })
        .catch((err) => {
          console.error('customFetch', err);
          reject(err);
        });
    });
  } catch (error) {
    Promise.reject({
      msg: 'api解析失败',
    });
  }
};

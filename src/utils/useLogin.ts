import { ref } from "vue";
// import { checkLogin, login } from "@/utils/wkbPro";
import wkbPro from "@wifikey/wkb-pro";
export function checkLogin() {
  return wkbPro.call({
    moudle: wkbPro.MoudleType.user,
    api: 'checkLogin',
  });
}

export function login(params: any = {}) {
  if (!params.from) Promise.reject('登陆来源不能为空');
  return wkbPro.call({
    moudle: wkbPro.MoudleType.user,
    api: 'login',
    params: {
      imModeLogin: false, // im协议 true;
      ...params,
    },
  });
}

export function useLogin() {
  const count = ref(0);
  let isLogin = ref(false);
  let isLoginHk = ref(false);
  /**
   * 检查登陆
   * @param {*} val eType: 打点登陆来源
   */
  function checkLoginHk(val: any = {}) {
    return new Promise((resolve, reject) => {
      // 检查登陆
      checkLogin()
        .then((res: any) => {
          const { data } = res;
          console.log("checkLoginHk==data", data);
          isLogin.value = !!data;
          isLoginHk.value = !!data;
          resolve(data);
        })
        .catch((err: any) => {
          console.error("checkLoginHk==err", err);
          isLogin.value = false;
          isLoginHk.value = false;
          reject(err);
        });
    });
  }

  /**
   * 获取登录信息
   * @param {*} val eType: 打点登陆来源
   */
  function needLoginHk(val: any = {}) {
    console.log("needLoginHk==");

    return new Promise((resolve, reject) => {
      // 检查登陆
      checkLogin()
        .then((res: any) => {
          const { data } = res;
          console.log("needLoginHk==", data);
          if (!data) {
            goToLogin(val)
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            resolve(data);
          }
        })
        .catch((err: any) => {
          const { data } = err;
          console.error("needLoginHk==", err, data);
          if (!data) {
            goToLogin(val)
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            reject(err);
          }
        });
    });
  }
  
  function goToLogin(val: any = {}) {
    return new Promise((resolve, reject) => {
      login({
        from: val.from || "wifi-shop",
        popPhoneCodeLoginAsDialog: true,
        mobileOperatorLogin: true,
        ...val,
      })
        .then((res: any) => {
          const { reload } = val;
          // 登陆成功
          if (reload) {
            window.location.reload();
          } else {
            resolve(res);
          }
        })
        .catch((err: any) => {
          // 登陆失败
          reject(err);
        });
    });
  }

  function getUserInfo () {
    return wkbPro.call({
      moudle: wkbPro.MoudleType.user,
      api: 'getActualUser',
    });

}
  return { count, goToLogin, needLoginHk, checkLoginHk, isLoginHk, isLogin, getUserInfo };
}

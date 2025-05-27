import { tracker } from "./tracker";
import { generateUniqueId } from "./helper";
import { version } from '@/utils/version';

export const executeAds = async ({
  onRequestSuccess,
  onClose,
  onError,
  canShowAds,
  isTeenager,
  isSVIP
}) => {
  const appInfo = await window?.tutu?.wk.getAppInfo();
  console.log('appInfo', appInfo);
  let isFast = appInfo?.data?.AppId === 'A0066';
  let sceneId = isFast ? '337' : '336';
  const appversion = isFast ? 'fast' : 'default';
  let strategy = {
    default: { "aSwitch": 1, "adStrategies": [{ "adCode": "965319175", "adSize": 0, "adSrc": "C", "bidType": 3, "ecpm": 400, "ecpmFactor": 1, "ecpmLevel": 0, "priority": 0, "ratio": 1, "renderType": 0 }, { "adCode": "9175787993985378", "adSize": 0, "adSrc": "G", "bidType": 3, "ecpm": 400, "ecpmFactor": 1, "ecpmLevel": 0, "priority": 0, "ratio": 1, "renderType": 0 }, { "adCode": "18059627", "adSize": 0, "adSrc": "B", "bidType": 3, "ecpm": 400, "ecpmFactor": 1, "ecpmLevel": 0, "priority": 0, "ratio": 1, "renderType": 0 }], "timeout": 0 },
    fast: { "aSwitch": 1, "adStrategies": [{ "adCode": "965319336", "adSize": 0, "adSrc": "C", "bidType": 3, "ecpm": 400, "ecpmFactor": 1, "ecpmLevel": 0, "priority": 0, "ratio": 1, "renderType": 0 }, { "adCode": "3145280933594036", "adSize": 0, "adSrc": "G", "bidType": 3, "ecpm": 400, "ecpmFactor": 1, "ecpmLevel": 0, "priority": 0, "ratio": 1, "renderType": 0 }, { "adCode": "18059591", "adSize": 0, "adSrc": "B", "bidType": 3, "ecpm": 400, "ecpmFactor": 1, "ecpmLevel": 0, "priority": 0, "ratio": 1, "renderType": 0 }], "timeout": 0 }
  }

  const params = { "sceneId": sceneId, "sceneName": "AI_bottom_banner", "type": 3, "expressType": 1, "strategy": JSON.stringify(strategy[appversion]) }
  const sceneName = 'AI_bottom_banner';

  try {
    window?.tutu?.feature.busi.addInventoryStart({ sceneId, sceneName });
    if (!canShowAds) {
      window?.tutu?.feature.busi.addInventoryEnd({
          sceneId,
          "xCode": isSVIP ? '1001' : '1002',
          "xInfo": "-1"
        });
      return
    }
    let uid = generateUniqueId()

    window?.tutu?.feature?.busi.adRequest(params, function (data) {
      let res;
      try {
        res = JSON.parse(data?.data);
      } catch (e) {
        console.error('广告请求数据解析失败', e);
        res = {}
      }
      tracker('ai_chatbot_deepseek_ad_req_result', {
        code: res?.code,
        originalRequestId: uid,
        version: version
      })
      if (+res?.code === 1) {
        console.log('广告请求成功', data);
        onRequestSuccess && onRequestSuccess(data);
        window?.tutu?.feature?.busi.showAd({ sceneId }, function (data) {
          console.log('广告展示成功', data);
          onClose && onClose(data);
          const parsedData = JSON.parse(data?.data);
          if (+parsedData.code === 6 || +parsedData.code === 4) {
            showAds.value = false;
            window?.tutu?.feature.busi.addInventoryEnd({
              sceneId,
              "xCode": "30046",
              "xInfo": "广告物填充"
            })
          }
        });
        tracker('ai_chatbot_deepseek_ad_show_trigger', {
          code: res?.code,
          originalRequestId: uid
        })
      }

      if (+res?.code === 2) {
         window?.tutu?.feature.busi.addInventoryEnd({
            sceneId,
            "xCode": "3001",
            "xInfo": "广告物填充"
          });
      }
    })
  } catch (err) {
    console.error('广告请求失败', err);
    onError && onError(err);

    await window?.tutu?.feature.busi.addInventoryEnd({
      sceneId,
      "xCode": "3001",
      "xInfo": "广告物填充"
    });
  }
}
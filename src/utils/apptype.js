export const isTutu = navigator.userAgent.includes('TuTuBrowser');

export function getUserAgentValue(key) {
    const userAgent = navigator.userAgent;
    const pattern = new RegExp(key + '\\/([^\\s]+)', 'i');
    const match = userAgent.match(pattern);
    return match ? match[1] : null;
  }
  
export const getAppType = () => {
    if (isTutu) {
      let str = getUserAgentValue("Vest");
      if (str === "jswk") {
        return "jswk";
      } else if (str === "wklite") {
        return "wklite";
      } else {
        return "wk";
      }
    } else {
      return "oldwk";
    }
};
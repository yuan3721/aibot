import { showToast } from "vant";
export const doCopy = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      // 现代浏览器使用 Clipboard API
      navigator.clipboard.writeText(text)
        .then(() => {
          showToast({
            message: '复制成功',
            // icon: 'passed',
            // duration: 0
          }
          );
        })
        .catch(() => fallbackCopyText(text));
    } else {
      // 旧版浏览器使用 `execCommand`
      fallbackCopyText(text);
    }
  }
  
  const fallbackCopyText = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // 避免影响页面布局
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast("复制成功");
    } catch (err) {
      showToast("复制失败，请手动复制");
    }
    document.body.removeChild(textarea);
  }
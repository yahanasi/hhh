// src/Weather/api.js
// 前端只负责请求自己的后端，不再直接访问 OpenWeather。

// 本地开发用的后端地址
const DEV_BASE_URL = "http://localhost:5000";

// 线上部署后的后端地址：
// 以后把这里改成你在腾讯云 / 其他平台部署后端得到的域名
const PROD_BASE_URL = "https://weathernow-backend-e5xl.onrender.com";

// 根据环境选择后端地址
const BASE_URL =
  process.env.NODE_ENV === "production" ? PROD_BASE_URL : DEV_BASE_URL;

/**
 * 获取天气信息
 * @param {string} city - 城市名称（Seoul / 서울 / 首尔 都可以）
 * @param {"ko"|"zh"|"en"} lang - 语言
 */
export async function getWeather(city, lang = "ko") {
  if (!city || !city.trim()) {
    return null;
  }

  try {
    const url =
      `${BASE_URL}/api/weather?` +
      `city=${encodeURIComponent(city)}` +
      `&lang=${encodeURIComponent(lang)}`;

    console.log("Request backend:", url);

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error("Backend error:", data);
      return null;
    }

    // 后端已经把城市名按语言处理好了，直接返回给 UI 用
    return data;
  } catch (error) {
    console.error("调用后端获取天气失败:", error);
    return null;
  }
}

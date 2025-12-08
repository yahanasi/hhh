const API_KEY = "052f8d4bd4445cbe12464d08513db811"; 

const API_LANG_MAP = {
  ko: "kr",     // 韩文
  zh: "zh_cn",  // 简体中文
  en: "en",     // 英文
};

// city 可以是 Seoul / 서울 / 首尔
export async function getWeather(city, lang = "ko") {
  try {
    const apiLang = API_LANG_MAP[lang] || "en";

    // ① 先用地理编码 API 按城市名查坐标（支持多语言别名）
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      city
    )}&limit=1&appid=${API_KEY}`;
    console.log("Geo URL:", geoUrl);

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    console.log("Geo data:", geoData);

    if (!Array.isArray(geoData) || geoData.length === 0) {
      console.error("도시를 찾을 수 없습니다.");
      return null;
    }

    const { lat, lon, name, local_names } = geoData[0];

    // ② 再用坐标查当前天气（带语言参数）
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${apiLang}`;
    console.log("Weather URL:", weatherUrl);

    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    console.log("Weather data:", weatherData);

    if (weatherRes.status !== 200 || String(weatherData.cod) !== "200") {
      console.error("Weather API Error:", weatherData);
      return null;
    }

    // ③ 按当前语言选一个好看的城市名
    let displayName = name;
    if (lang === "ko" && local_names?.ko) {
      displayName = local_names.ko;
    } else if (lang === "zh" && (local_names?.zh || local_names?.zh_cn)) {
      displayName = local_names.zh || local_names.zh_cn;
    } else if (lang === "en" && local_names?.en) {
      displayName = local_names.en;
    }

    // 覆盖 name，这样前端直接用 data.name 显示
    return {
      ...weatherData,
      name: displayName,
    };
  } catch (error) {
    console.error("날씨 정보를 불러오지 못했습니다:", error);
    return null;
  }
}

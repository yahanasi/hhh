const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.error("❌ 没有找到 OPENWEATHER_API_KEY，请在 .env 中配置");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const API_LANG_MAP = {
  ko: "kr",
  zh: "zh_cn",
  en: "en",
};

// GET /api/weather?city=Seoul&lang=ko
app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city;
    const lang = req.query.lang || "ko";

    if (!city) {
      return res.status(400).json({ error: "缺少 city 参数" });
    }

    const apiLang = API_LANG_MAP[lang] || "en";

    // ① 地理编码
    const geoUrl =
      `https://api.openweathermap.org/geo/1.0/direct` +
      `?q=${encodeURIComponent(city)}` +
      `&limit=1&appid=${API_KEY}`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!Array.isArray(geoData) || geoData.length === 0) {
      return res.status(404).json({ error: "城市未找到" });
    }

    const { lat, lon, name, local_names } = geoData[0];

    // ② 天气
    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${lat}&lon=${lon}` +
      `&appid=${API_KEY}` +
      `&units=metric` +
      `&lang=${apiLang}`;

    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (!weatherRes.ok || String(weatherData.cod) !== "200") {
      return res.status(weatherRes.status).json(weatherData);
    }

    // ③ 根据语言挑一个好看的城市名
    let displayName = name;
    if (lang === "ko" && local_names?.ko) {
      displayName = local_names.ko;
    } else if (lang === "zh" && (local_names?.zh || local_names?.zh_cn)) {
      displayName = local_names.zh || local_names.zh_cn;
    } else if (lang === "en" && local_names?.en) {
      displayName = local_names.en;
    }

    res.json({
      ...weatherData,
      name: displayName,
    });
  } catch (err) {
    console.error("服务器内部错误:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Weather backend running at http://localhost:${PORT}`);
});

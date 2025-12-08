import React from "react";
import "./weather.css";

const texts = {
  ko: {
    noResult: "검색 결과 없음",
    temp: "온도",
    humidity: "습도",
    wind: "풍속",
  },
  zh: {
    noResult: "暂无结果",
    temp: "温度",
    humidity: "湿度",
    wind: "风速",
  },
  en: {
    noResult: "No result",
    temp: "Temperature",
    humidity: "Humidity",
    wind: "Wind speed",
  },
};

export default function WeatherUI({ data, lang }) {
  const t = texts[lang] || texts.ko;

  if (!data) {
    return <div className="weather-container">{t.noResult}</div>;
  }

  return (
    <div className="weather-container">
      <h2>{data.name}</h2>
      <p>
        🌡 {t.temp}: {data.main.temp}°C
      </p>
      <p>
        💧 {t.humidity}: {data.main.humidity}%
      </p>
      <p>
        🍃 {t.wind}: {data.wind.speed} m/s
      </p>
      {/* 这一行是 OpenWeather 返回的描述，会随着 API 的 lang 参数变语言 */}
      <p>{data.weather[0].description}</p>
    </div>
  );
}

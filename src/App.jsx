// 引入 React 以及两个常用 Hook：useState（状态）和 useEffect（副作用）
import React, { useState, useEffect } from "react";
// 引入 React Router 提供的组件：BrowserRouter（路由容器）、Routes/Route（路由注册）、Link（导航链接）
import { HashRouter, Routes, Route, Link } from "react-router-dom";
// 引入全局样式（页面整体布局、导航、语言切换、搜索区等样式）
import "./App.css";
// 引入封装好的天气 API 请求函数
import { getWeather } from "./Weather/api";
// 引入显示天气信息的子组件
import WeatherUI from "./Weather/WeatherUI.jsx";
// 引入管理收藏城市的页面组件
import Favorites from "./Weather/Favorites.jsx";

// 多语言文本字典，根据当前语言 lang（ko / zh / en）选择对应的界面文案
const translations = {
  ko: {
    appTitle: "WeatherNow 날씨 조회", // 应用标题（韩文）
    navSearch: "날씨 검색", // 导航：天气搜索
    navFavorites: "즐겨찾기 도시", // 导航：收藏城市
    searchPlaceholder: "도시 이름을 영어로 입력하세요 (예: Seoul, Tokyo)", // 搜索框占位符
    searchButton: "검색", // 搜索按钮文字
    addFavoriteButton: "현재 도시 즐겨찾기에 추가", // 把当前城市加入收藏
    previewTitle: "즐겨찾기 도시 (미리보기)", // 收藏城市预览标题
    previewHint: '자세히 보려면 위의 "즐겨찾기 도시" 메뉴를 선택하세요.', // 提示文字
    footerText: "WeatherNow © 2025", // 底部版权信息
  },
  zh: {
    appTitle: "WeatherNow 天气查询",
    navSearch: "天气查询",
    navFavorites: "收藏城市",
    searchPlaceholder: "请输入城市英文名称（例如：Seoul, Tokyo）",
    searchButton: "搜索",
    addFavoriteButton: "将当前城市加入收藏",
    previewTitle: "收藏城市（预览）",
    previewHint: "如需更多操作，请点击上方的“收藏城市”菜单。",
    footerText: "WeatherNow © 2025",
  },
  en: {
    appTitle: "WeatherNow Weather Search",
    navSearch: "Weather Search",
    navFavorites: "Favorite Cities",
    searchPlaceholder: "Enter city name in English (e.g. Seoul, Tokyo)",
    searchButton: "Search",
    addFavoriteButton: "Add current city to favorites",
    previewTitle: "Favorite Cities (Preview)",
    previewHint: 'For more actions, open the "Favorite Cities" page above.',
    footerText: "WeatherNow © 2025",
  },
};

// 应用的根组件：负责
// 1. 全局状态管理（语言、输入城市、天气结果、收藏列表）
// 2. 路由控制（首页 / 收藏页）
// 3. 把数据和回调函数传给子组件
function App() {
  // 当前语言（ko/zh/en），默认韩文
  const [lang, setLang] = useState("ko");
  // 搜索输入框中的城市名（用户输入的原始字符串：可以是中/韩/英）
  const [city, setCity] = useState("");
  // 当前查询得到的天气数据（从 API 返回的对象，没有数据时为 null）
  const [weatherData, setWeatherData] = useState(null);
  // 收藏城市列表（数组），每个元素形如 { id, name, temp, memo }
  const [favorites, setFavorites] = useState([]);

  // 根据当前语言，从 translations 中取出对应的文案对象
  // 如果 lang 不在字典中，则回退到韩文
  const t = translations[lang] || translations.ko;

  // -------------------------------
  // 1）组件挂载时，从 localStorage 读取收藏列表
  // -------------------------------
  useEffect(() => {
    // 从浏览器本地存储中读取名为 "favorites" 的数据（字符串）
    const saved = localStorage.getItem("favorites");
    if (saved) {
      try {
        // 尝试把 JSON 字符串转成数组
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("localStorage 파싱 오류:", e);
      }
    }
    // 依赖数组为空 []，表示只在组件首次渲染时执行一次
  }, []);

  // -------------------------------
  // 2）每当 favorites 改变时，把最新的收藏列表写回 localStorage
  // -------------------------------
  useEffect(() => {
    // 将收藏列表数组序列化为 JSON 字符串后写入 localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));
    // 依赖 favorites，表示 favorites 每次变化时都会执行这个 effect
  }, [favorites]);

  // 点击“搜索”按钮或按下 Enter 时调用
  const handleSearch = async () => {
    // 如果输入为空或全是空格，则不执行搜索
    if (!city.trim()) return;
    // 调用封装好的 getWeather 函数，请求天气数据
    // 传入 city（可以是中/韩/英）和当前界面的语言 lang
    const data = await getWeather(city, lang);
    // 将返回的数据保存到状态中，触发界面更新
    setWeatherData(data);
  };

  // 点击“将当前城市加入收藏”时调用
  const handleAddFavorite = () => {
    // 如果当前没有任何天气数据（还没搜索或者搜索失败），则不处理
    if (!weatherData) return;

    // 使用天气数据中的城市名作为收藏的名称（已经根据语言做过处理）
    const cityName = weatherData.name;
    // 使用函数式更新，确保拿到最新的 favorites
    setFavorites((prev) => {
      // 如果列表中已经存在同名城市，则不重复添加
      if (prev.some((item) => item.name === cityName)) return prev;

      // 构造一个新的收藏项对象
      const newItem = {
        id: Date.now(), // 以当前时间戳作为简单的唯一 ID
        name: cityName, // 城市名
        temp: weatherData.main.temp, // 当前温度
        memo: "", // 备注，初始为空字符串
      };
      // 返回新的数组（旧列表 + 新项）
      return [...prev, newItem];
    });
  };

  // 在收藏列表中更新某一条城市的 memo（备注）
  // id: 要更新的城市 ID
  // newMemo: 新的备注内容
  const handleUpdateFavorite = (id, newMemo) => {
    setFavorites((prev) =>
      // 使用 map 返回一个新数组
      prev.map((item) =>
        // 如果 ID 相同，则返回一个新的对象，更新 memo
        item.id === id ? { ...item, memo: newMemo } : item
      )
    );
  };

  // 删除收藏列表中的某一条城市
  const handleRemoveFavorite = (id) => {
    setFavorites((prev) =>
      // 过滤掉 ID 匹配的那一项，返回一个新数组
      prev.filter((item) => item.id !== id)
    );
  };

  // 清空所有收藏
  const handleClearFavorites = () => {
    setFavorites([]);
  };

  // 切换当前界面语言
  const handleChangeLang = (newLang) => {
    setLang(newLang);
    // 注意：切换语言后，不会立刻重新请求天气，
    // 但下一次搜索时，会以最新 lang 调用 getWeather；
    // 同时界面文案会立即根据 lang 切换。
  };

  return (
    // BrowserRouter：包裹整个应用，使之具备路由功能（支持 / 和 /favorites 两个路径）
    <HashRouter>
      <div className="container">
        <header>
          {/* 根据当前语言显示对应的标题文字 */}
          <h1>{t.appTitle}</h1>

          {/* 语言切换区域：三个按钮分别设置为韩/中/英 */}
          <div className="lang-switch">
            <button
              // 当 lang 等于 "ko" 时，给按钮添加 active 样式
              className={lang === "ko" ? "active" : ""}
              onClick={() => handleChangeLang("ko")}
            >
              한국어
            </button>
            <button
              className={lang === "zh" ? "active" : ""}
              onClick={() => handleChangeLang("zh")}
            >
              中文
            </button>
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => handleChangeLang("en")}
            >
              EN
            </button>
          </div>

          {/* 导航栏：使用 Link 实现前端路由跳转，而不是整页刷新 */}
          <nav className="nav">
            {/* 跳转到首页（天气搜索页面） */}
            <Link to="/">{t.navSearch}</Link>
            {/* 跳转到收藏城市管理页面 */}
            <Link to="/favorites">{t.navFavorites}</Link>
          </nav>
        </header>

        <main>
          {/* 路由配置区：根据当前 URL 渲染不同页面内容 */}
          <Routes>
            {/* 首页路径："/" */}
            <Route
              path="/"
              // element 属性中是首页要渲染的内容（一个 Fragment 包住多个元素）
              element={
                <>
                  {/* 搜索区域：输入 + 按钮 */}
                  <div className="search-container">
                    <input
                      type="text"
                      // 占位文本根据当前语言变化
                      placeholder={t.searchPlaceholder}
                      // 受控组件：value 由 state city 决定
                      value={city}
                      // 输入变化时更新 city
                      onChange={(e) => setCity(e.target.value)}
                      // 在输入框按下回车键时也触发搜索
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                    />
                    {/* 搜索按钮：点击时调用 handleSearch */}
                    <button onClick={handleSearch}>{t.searchButton}</button>
                  </div>

                  {/* 天气显示组件：把 API 返回的数据和当前语言传进去 */}
                  <WeatherUI data={weatherData} lang={lang} />

                  {/* 如果已经成功得到天气数据，则显示“添加到收藏”按钮 */}
                  {weatherData && (
                    <div className="favorite-add-container">
                      <button onClick={handleAddFavorite}>
                        {t.addFavoriteButton}
                      </button>
                    </div>
                  )}

                  {/* 如果收藏列表不为空，在首页底部显示一个预览列表 */}
                  {favorites.length > 0 && (
                    <div className="favorite-preview">
                      <h3>{t.previewTitle}</h3>
                      <ul>
                        {/* 使用 map 渲染收藏城市简要信息 */}
                        {favorites.map((item) => (
                          <li key={item.id}>
                            {item.name} ({item.temp}°C)
                          </li>
                        ))}
                      </ul>
                      {/* 提示用户可以去“收藏城市”页面进行更多操作 */}
                      <p className="favorite-preview-hint">
                        {t.previewHint}
                      </p>
                    </div>
                  )}
                </>
              }
            />

            {/* 收藏页面路径："/favorites" */}
            <Route
              path="/favorites"
              element={
                <Favorites
                  // 传入收藏列表
                  favorites={favorites}
                  // 传入更新某一项 memo 的回调
                  onUpdateFavorite={handleUpdateFavorite}
                  // 传入删除某一项的回调
                  onRemoveFavorite={handleRemoveFavorite}
                  // 传入清空全部收藏的回调
                  onClearFavorites={handleClearFavorites}
                  // 当前语言，用于在收藏页面显示对应语言文本
                  lang={lang}
                />
              }
            />
          </Routes>
        </main>

        <footer>
          {/* 底部文字，同样使用多语言字典中的 footerText */}
          <p>{t.footerText}</p>
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;

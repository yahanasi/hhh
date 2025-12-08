import React from "react";
import "./weather.css"; 
// 引入 React 库，用于创建组件
// 引入 weather.css 样式文件（收藏页面和天气卡片共用样式）

// 文本多语言字典：根据 lang（ko / zh / en）选择对应语言显示
const texts = {
  ko: {
    title: "즐겨찾기 도시 관리", // 收藏城市管理（韩文）
    empty: "아직 추가된 즐겨찾기 도시가 없습니다.", // 尚未添加收藏城市
    memoPlaceholder: "메모를 입력하세요 (예: 여행, 고향, 친구 집)", // 请输入备注
    delete: "삭제", // 删除
    clearAll: "전체 삭제", // 清空全部
  },
  zh: {
    title: "收藏城市管理",
    empty: "还没有添加任何收藏城市。",
    memoPlaceholder: "请输入备注（例如：旅行、家乡、朋友在这里）",
    delete: "删除",
    clearAll: "清空全部",
  },
  en: {
    title: "Favorite Cities",
    empty: "No favorite cities yet.",
    memoPlaceholder:
      "Add a note (e.g. trip, hometown, friend lives here)",
    delete: "Delete",
    clearAll: "Clear all",
  },
};

// 单个收藏城市条目组件
// props 说明：
// - item: 当前这条收藏城市对象 { id, name, temp, memo }
// - onUpdate: 更新 memo 的回调函数（来自父组件）
// - onRemove: 删除当前城市的回调函数（来自父组件）
// - lang: 当前语言，用于选择文本
function FavoriteItem({ item, onUpdate, onRemove, lang }) {
  // 根据当前语言选择对应文本，默认使用韩文（防止 lang 异常时出错）
  const t = texts[lang] || texts.ko;

  // 当备注输入框内容改变时触发，通知父组件更新该城市的 memo
  const handleChange = (e) => {
    // 调用父组件传进来的 onUpdate，传递当前城市 id 和最新的备注内容
    onUpdate(item.id, e.target.value);
  };

  return (
    <div className="favorite-item">
      {/* 左侧主内容区域：城市名、温度、备注输入框 */}
      <div className="favorite-main">
        {/* 标题区域：城市名 + 温度 */}
        <div className="favorite-title">
          <span className="favorite-city">{item.name}</span>
          <span className="favorite-temp">{item.temp}°C</span>
        </div>
        {/* 备注输入框：用于给收藏城市添加说明（例如“家乡”、“旅游”） */}
        <input
          className="favorite-memo"
          type="text"
          placeholder={t.memoPlaceholder} // 根据语言显示不同占位提示
          value={item.memo || ""} // 若 memo 为空则显示空字符串，避免出现 undefined
          onChange={handleChange} // 每次输入变化时调用 handleChange
        />
      </div>

      {/* 右侧删除按钮：点击后删除当前收藏城市 */}
      <button
        className="favorite-delete"
        onClick={() => onRemove(item.id)} // 调用父组件传进来的删除函数
      >
        {t.delete}
      </button>
    </div>
  );
}

// 收藏页面主组件
// props 说明：
// - favorites: 收藏城市列表数组 [{ id, name, temp, memo }, ...]
// - onUpdateFavorite: 更新某个收藏城市 memo 的回调
// - onRemoveFavorite: 删除某个收藏城市的回调
// - onClearFavorites: 清空所有收藏的回调
// - lang: 当前语言
export default function Favorites({
  favorites,
  onUpdateFavorite,
  onRemoveFavorite,
  onClearFavorites,
  lang,
}) {
  // 根据当前语言选择对应文本
  const t = texts[lang] || texts.ko;

  return (
    <div className="favorites-container">
      {/* 页面标题：收藏城市管理 */}
      <h2>{t.title}</h2>

      {/* 如果没有任何收藏城市，显示一段“空列表”的提示文字 */}
      {favorites.length === 0 ? (
        <p className="favorites-empty">{t.empty}</p>
      ) : (
        <>
          {/* 收藏城市列表：使用 map 进行列表渲染（满足“列表渲染 / map”要求） */}
          <div className="favorites-list">
            {favorites.map((item) => (
              <FavoriteItem
                key={item.id}                     // React 列表渲染需要的唯一 key
                item={item}                       // 当前城市对象
                onUpdate={onUpdateFavorite}       // 传给子组件的“更新 memo”函数
                onRemove={onRemoveFavorite}       // 传给子组件的“删除城市”函数
                lang={lang}                       // 当前语言，用于多语言显示
              />
            ))}
          </div>

          {/* 底部“全部清空”按钮：删除所有收藏（D 中的 bulk delete） */}
          <button
            className="favorites-clear"
            onClick={onClearFavorites} // 调用父组件提供的清空函数
          >
            {t.clearAll}
          </button>
        </>
      )}
    </div>
  );
}

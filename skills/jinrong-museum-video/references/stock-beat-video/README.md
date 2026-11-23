# 无配音股价走势卡点片：范例工程

- `拆解笔记.md`：标准参考片（恒指 1969–2026）的逐项拆解，以及我们怎么用。
- `MV4.tsx`：英伟达 v4（2026-11-24）的 Remotion 合成，竖屏 1080×1920、60fps。包含镜头跟线头、每根 K 线卡拍、火花、烟花、关口线、闪电、碎玻璃、火箭跟线、九宫格齐涨、数据牌一摞，以及震屏、色散和压音乐的写法。

## 复用方法
1. 数据：Yahoo Finance chart API（`range=2y&interval=1d` 取日线；`range=1d&interval=1m&includePrePost=true` 取含盘前的 1 分钟线），整理成 `d4.json`（日线 `[date,o,h,l,c]`）和 `data.json`（分时、九宫格）。
2. 节拍：`librosa.beat.beat_track(units='time')` 存成 `fever_beats.json`；把 `MS`（音乐起点）、`B20`（暴跌日落在哪拍）、`T2`（最大爆点）、`T5`、`TEND` 改成新歌的时间。
3. 依赖：`../kit/Caption`（loadFonts）、`../lin/lin`（k01、outq），以及 `public/sfx` 下的 boom、hit、timpani、swoosh、shatter、thud、tap。
4. Root 里注册：`<Composition id="NV-MV4" component={MV4} durationInFrames={MV4_END} fps={60} width={1080} height={1920} />`。

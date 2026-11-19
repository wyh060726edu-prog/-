# 场景渲染储备库（抖音AI视频项目通用）

2026-11-19 由用户从 GitHub 精选清单里挑定（第 13–24 号），给整个「金融博物馆」项目用，不只某一支片。
目标：场景画得精细、像真的街景、地标、店铺、城市夜景（如大湾区繁华景象），不再粗糙。

全部是 MIT 许可，这里放的是**精简副本**（去掉了图片、视频、音频、字体、3D 模型和大文件），原 LICENSE 和来源见每个目录的 `SOURCE.md`。

## 在云环境里怎么用

```bash
bash skills-library/install.sh          # 把下面的 skill 软链接进 ~/.claude/skills
bash skills-library/fetch-full.sh diorama   # 要完整示例媒体时，克隆上游完整版到 _full/
```

## 每个库的读后要点

| # | 目录 | 上游 | 是什么 | 对我们怎么用 | 依赖与坑 |
|---|---|---|---|---|---|
| 13 | `diorama/` | [sloemo01/diorama](https://github.com/sloemo01/diorama) | Three.js 精细微缩场景手册（SKILL.md 3700 行）：64 色调色板+有序抖动+墨线轮廓，小人有真关节动画；三种画法：经典像素、描边卡通、像素+描边 | 一条街、夜市、银行、港口做成会动的精细微缩景。它的「预留空间、按动作全程查碰撞」规则正好治元素重叠 | 开工前要先回答两个问题：选哪种画法、模型自己写还是用网上免费模型（推荐 hybrid）。网上模型要查商用许可 |
| 14 | `noxe-pixel-engine/` | [danieljan-design/noxe-pixel-engine](https://github.com/danieljan-design/noxe-pixel-engine) | 浏览器里把 3D 场景实时渲染成像素画：昼夜（灯和窗户天黑自动亮）、雨雪雾雷、湖面湿街反射，能导 60fps MP4 带声音 | 维港夜景、霓虹湿街、渡轮空镜；时间从黄昏推到夜晚一键完成 | 不是 skill，是代码库，看 README；场景全是代码建模，无外部素材 |
| 15 | `anatomy/` | [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) | 画细节极密的等距 SVG 插画：每张 40–150 个零件、四档明暗、正确前后遮挡顺序 | 交易所、印钞机、港口吊机、银行金库的剖面图；它的零件清单和「从后往前画」规则可直接借 | Node 20.10+，Chromium 自检（我们环境已有） |
| 16 | `claude-drawing-skill/` | [cloveric/claude-drawing-skill](https://github.com/cloveric/claude-drawing-skill) | 中文 skill，Python（numpy+Pillow）程序化作画 83 种画风：水墨、水彩、油画厚涂、剪纸、复古水粉、黄金时代漫画等；能输出逐步画出来的动图 | 每期换主风格；做「一幅画慢慢画出来」的开场或留白段；封面插画 | 纯 CPU 离线；每种画风有自己的毛病清单，要画 2–4 轮再改 |
| 17 | `weilanx-claude-videos/` | [Azure12355/weilanx-claude-videos](https://github.com/Azure12355/weilanx-claude-videos) | 和我们几乎一样的流程：Remotion+React+SVG 讲解片，程序合成音效，动画卡字幕或拍子；8 个风格 skill（像素、黑金、台灯、Vox、FPS 等）+ 一个「从参考视频提炼风格」skill | 直接对照它的像素风 skill 和场景写法；它也用「锚词」做选题，distill skill 可用来拆用户给的参考视频 | 原样 skill 偏向它自己的工程结构，借方法别照搬路径 |
| 18 | `codixel/` | [mankidev/codixel](https://github.com/mankidev/codixel) | 教 Claude 画好像素画：别凭空画，先找真实参考图→像素化→加骨骼→动画→逐帧查；自带 `core/pixel.js`（火焰、烟、循环噪声） | 馆长、道具、地标（汇丰、中银大厦）先找实拍参考图再像素化，比凭空画好得多；烟和火焰直接用它的 | 参考图要可合法使用 |
| 19 | `iso-cities/` | [RayNCooper/iso-cities](https://github.com/RayNCooper/iso-cities) | `npx iso-cities "Central, Hong Kong"`：用 OpenStreetMap 真实楼体高度画等距像素城市，有黄昏等主题 | 香港、深圳、新加坡的真实城市俯瞰图做章节地标 | 要能连 OpenStreetMap/Nominatim，云环境网络可能拦，用前先试；成图要注明 © OpenStreetMap |
| 20 | `Three-geo-play/` | [lorenzoMezza/Three-geo-play](https://github.com/lorenzoMezza/Three-geo-play) | npm 包 `lm-three-geo-play`：OpenStreetMap 矢量瓦片在 Three.js 里立成 3D 道路、水面、楼体，带实时阴影 | 深圳湾、维港航拍式推镜 | 要连 tiles.openfreemap.org；demo 数据太大已去掉 |
| 21 | `pixel-path/` | [jonwheatley/pixel-path](https://github.com/jonwheatley/pixel-path) | 两地之间真实道路的像素风第一人称飞越 | 「从香港到深圳」这类转场 | 路线和地图免费，但**风景图要 RetroDiffusion 付费 API key**；README 里的注册链接是作者的推广链接 |
| 22 | `3dviz-pro-max/` | [viettranx/3dviz-pro-max](https://github.com/viettranx/3dviz-pro-max) | 把想法做成 Three.js/Blender 3D 场景，带场景目录、套件和骨骼 | 立体城市天际线、灯光、科普用 3D 模型 | skill 在 `skills/3dviz-pro-max/` |
| 23 | `claude-animated-shorts/` | [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) | 55–70 秒竖屏「2D 角色在 3D 世界里」短片：墨线、彩绘小镇、景深、滑动镜头；附 20 支参考片测出来的风格手册 | 馆长在立体街景里走；它的 QA 规则（静止超过 12 帧会像卡住，每个停留都要慢推镜）值得照用 | 要 `@remotion/three`；完整版 public/ 约 1.3GB，参考帧已去掉 |
| 24 | `blender-skills/` | [arjun988/blender-skills](https://github.com/arjun988/blender-skills) | 94 个 Blender 专项 skill（建模、灯光、渲染、HD-2D、像素、霓虹复古未来等风格） | 效果最真实的路线 | 云环境要先装 Blender，渲染慢；`install.sh` 默认不装，要用再手动链接 |

## 共同的教训（从这些库读出来的）
- **先找真实参考，再用代码还原**（codixel、diorama 都这么说）：地标、店铺别凭空画。
- **给每个元素预留整块空间并全程查碰撞**（diorama）：这是治重叠的办法，渲染后照旧逐帧抽查。
- **静止画面也要慢推镜**（claude-animated-shorts）：超过 12 帧不动就像卡住。
- 代码画的场景到不了照片级；要「真实繁华」的空镜，配合免费实拍素材用。

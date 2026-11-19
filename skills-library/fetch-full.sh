#!/usr/bin/env bash
# 把某个库的完整上游版本（含示例图片、视频、模型）克隆到 skills-library/_full/<名字>
# 用法：bash skills-library/fetch-full.sh diorama   （不带参数 = 全部）
set -e
cd "$(dirname "$0")"
declare -A UP=(
  [diorama]=sloemo01 [noxe-pixel-engine]=danieljan-design [anatomy]=wheresryan22
  [claude-drawing-skill]=cloveric [weilanx-claude-videos]=Azure12355 [codixel]=mankidev
  [iso-cities]=RayNCooper [Three-geo-play]=lorenzoMezza
  [3dviz-pro-max]=viettranx [claude-animated-shorts]=mromidev [blender-skills]=arjun988
)
names=("$@"); [ ${#names[@]} -eq 0 ] && names=("${!UP[@]}")
mkdir -p _full
for n in "${names[@]}"; do
  o=${UP[$n]}; [ -z "$o" ] && { echo "未知: $n"; continue; }
  [ -d "_full/$n" ] && { echo "已有 _full/$n"; continue; }
  git clone --depth 1 "https://github.com/$o/$n.git" "_full/$n"
done

#!/usr/bin/env bash
# 把储备库里的 skill 装进当前云环境的 ~/.claude/skills（软链接，不复制）
# 用法：bash skills-library/install.sh
set -e
LIB="$(cd "$(dirname "$0")" && pwd)"
DEST="${HOME}/.claude/skills"
mkdir -p "$DEST"
link() { [ -f "$1/SKILL.md" ] && ln -sfn "$1" "$DEST/$2" && echo "装好 $2"; }
link "$LIB/diorama" diorama
link "$LIB/anatomy" anatomy
link "$LIB/claude-drawing-skill" claude-drawing
link "$LIB/codixel" codixel
link "$LIB/pixel-path" pixel-path
link "$LIB/3dviz-pro-max/skills/3dviz-pro-max" 3dviz-pro-max
link "$LIB/claude-animated-shorts" cartoon-3d-short
link "$LIB/weilanx-claude-videos/.claude/skills/weilanx-creator-pixel-video" weilanx-pixel-video
link "$LIB/weilanx-claude-videos/.claude/skills/weilanx-creator-distill-video" weilanx-distill-video
# blender-skills 有 94 个，需要先装 Blender，默认不装；要用时手动链接：
#   ln -sfn "$LIB/blender-skills/.claude/skills/<名字>" "$DEST/<名字>"
# noxe-pixel-engine、iso-cities、Three-geo-play 是代码库不是 skill，直接按各自 README 用。

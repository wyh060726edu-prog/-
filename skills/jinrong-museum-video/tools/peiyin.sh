#!/bin/bash
# 用法：peiyin [台词.txt]   不写文件就自动用「下载」里最新的 *配音稿*.txt
# 参考音：第一次自动从「下载」里找 ref_*.wav 拷进来；换声音就把新的 ref_*.wav 和同名 .txt（原话）放进「下载」再跑
set -e
D="$HOME/cosyvoice"; DL="$HOME/Downloads"
R=$(ls -t "$DL"/ref_*.wav 2>/dev/null | head -1 || true)
if [ -n "$R" ] && [ "$R" -nt "$D/ref.wav" -o ! -f "$D/ref.wav" ]; then
  cp "$R" "$D/ref.wav"; T="${R%.wav}.txt"
  if [ -f "$T" ]; then cp "$T" "$D/ref.txt"; else
    echo "今天上午，深圳，二十一个经济体的领导人拍了一张合影。每个人脖子上，都围着一条红色或者蓝色的围巾。" > "$D/ref.txt"; fi
fi
[ -f "$D/ref.wav" ] || { echo "没找到参考音：先把 ref_APEC前两句.wav 下载到「下载」文件夹"; exit 1; }
S="${1:-$(ls -t "$DL"/*配音稿*.txt 2>/dev/null | head -1)}"
[ -f "$S" ] || { echo "没找到台词：把 *配音稿*.txt 下载到「下载」文件夹，或者 peiyin 文件路径"; exit 1; }
N=$(basename "$S" .txt); O="$HOME/Desktop/配音输出/$N"
echo "台词：$S"; echo "输出：$O"
COSYVOICE_HOME="$D" "$D/venv/bin/python" "$D/cosyvoice_tts.py" "$S" "$O" --ref "$D/ref.wav" --ref-text "$(cat "$D/ref.txt")" ${SPEED:+--speed $SPEED}
cd "$O/.." && rm -f "$N.zip" && zip -qr "$N.zip" "$N/voice.wav" "$N/voice.json" "$N/lines"
open "$O/.." 2>/dev/null || true
echo "好了：把桌面「配音输出」里的 $N.zip 发给 Claude 就行。"

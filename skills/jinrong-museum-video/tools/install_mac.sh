#!/bin/bash
# 金融博物馆 · 本地 AI 配音一键安装（Mac，Apple 芯片）。可重复运行。
set -e
D="$HOME/cosyvoice"; mkdir -p "$D" && cd "$D"
if [ "$(uname)" = Darwin ] && ! xcode-select -p >/dev/null 2>&1; then
  xcode-select --install || true
  echo "弹窗里点「安装」，装完后把这行命令再粘贴一次就行。"; exit 0
fi
echo "==> 1/5 安装 uv（Python 管理工具）"
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
echo "==> 2/5 下载 CosyVoice 代码"
[ -d CosyVoice ] || git clone -q --depth 1 https://github.com/FunAudioLLM/CosyVoice.git
M=CosyVoice/third_party/Matcha-TTS
[ -f $M/setup.py ] || { rm -rf $M; git clone -q --depth 1 https://github.com/shivammehta25/Matcha-TTS.git $M; }
echo "==> 3/5 安装依赖（几分钟）"
[ -x venv/bin/python ] || uv venv -q -p 3.11 venv
uv pip install -q -p venv/bin/python torch torchaudio numpy soundfile librosa HyperPyYAML hydra-core omegaconf \
  conformer diffusers transformers==4.51.3 x-transformers onnxruntime inflect wetext openai-whisper einops \
  huggingface_hub modelscope pyarrow lightning \
  rich gdown matplotlib wget pyworld "setuptools<81"
echo "==> 4/5 下载模型（约 5GB，看网速 5–20 分钟）"
venv/bin/python -c "from huggingface_hub import snapshot_download as s; s('FunAudioLLM/Fun-CosyVoice3-0.5B-2512', \
  local_dir='$D/models/cv3', ignore_patterns=['llm.rl.pt','*.batch.onnx','flow.decoder.estimator*'])"
echo "==> 5/5 安装配音命令"
U=https://raw.githubusercontent.com/wyh060726edu-prog/-/main/skills/jinrong-museum-video/tools
curl -fsSL $U/cosyvoice_tts.py -o cosyvoice_tts.py
curl -fsSL $U/peiyin.sh -o peiyin && chmod +x peiyin
mkdir -p "$HOME/.local/bin" && ln -sf "$D/peiyin" "$HOME/.local/bin/peiyin"
grep -q '.local/bin' "$HOME/.zshrc" 2>/dev/null || echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
echo "装好了。以后打开终端输入 peiyin 回车就能配音。"

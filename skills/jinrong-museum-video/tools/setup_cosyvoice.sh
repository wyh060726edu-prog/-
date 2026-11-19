#!/bin/bash
# 金融博物馆：预装 CosyVoice3 中文配音（CPU）到 /opt/cosyvoice
set -e
C=/opt/cosyvoice
mkdir -p $C && cd $C
[ -d CosyVoice ] || git clone -q --depth 1 https://github.com/FunAudioLLM/CosyVoice.git
[ -f CosyVoice/third_party/Matcha-TTS/setup.py ] || { rm -rf CosyVoice/third_party/Matcha-TTS; git clone -q --depth 1 https://github.com/shivammehta25/Matcha-TTS.git CosyVoice/third_party/Matcha-TTS; }
[ -x venv/bin/python ] || python3 -m venv venv
venv/bin/pip install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu
venv/bin/pip install -q numpy conformer diffusers hydra-core HyperPyYAML inflect librosa omegaconf onnx onnxruntime openai-whisper protobuf pyarrow pydantic pyworld rich soundfile transformers==4.51.3 x-transformers wetext wget lightning matplotlib gdown modelscope huggingface_hub einops
venv/bin/python -c "from huggingface_hub import snapshot_download as s; s('FunAudioLLM/Fun-CosyVoice3-0.5B-2512', local_dir='$C/models/cv3', ignore_patterns=['llm.rl.pt','*.batch.onnx','flow.decoder.estimator*'])"
pip install -q sherpa-onnx soundfile librosa || true
echo "cosyvoice ready"

#!/usr/bin/env python3
"""金融博物馆 · AI 配音：Fun-CosyVoice3-0.5B 零样本克隆（CPU 可跑）

用法:
  /opt/cosyvoice/venv/bin/python cosyvoice_tts.py script.txt out_dir \
      --ref ref.wav --ref-text "参考音里说的原话" [--speed 1.15] [--gap 0.2]
script.txt 每行一句（空行忽略）。输出:
  out_dir/voice.wav   单声道配音
  out_dir/voice.json  {"duration", "sentences":[{"text","start","end"}]}（秒）
  out_dir/lines/NNN.wav  每句单独一份，方便只重做某句（--only 3,7）
参考音：5–15 秒、干净无 bgm、一个人说话；--ref-text 必须和参考音逐字一致。
环境：setup 脚本装在 /opt/cosyvoice（代码 CosyVoice/，模型 models/cv3/）。
"""
import argparse, json, os, sys, time
import numpy as np, soundfile as sf, torch, torchaudio

ROOT = os.environ.get('COSYVOICE_HOME', '/opt/cosyvoice')
sys.path += [ROOT + '/CosyVoice', ROOT + '/CosyVoice/third_party/Matcha-TTS']

def _load(p, *a, **k):  # 新版 torchaudio 要 torchcodec，这里用 soundfile 代替
    y, sr = sf.read(p, dtype='float32', always_2d=True)
    return torch.from_numpy(y.T.copy()), sr
torchaudio.load = _load

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('script'); ap.add_argument('out')
    ap.add_argument('--ref', required=True); ap.add_argument('--ref-text', required=True)
    ap.add_argument('--speed', type=float, default=1.15, help='整体语速，铺垫段 1.1–1.25，高潮可 1.0')
    ap.add_argument('--gap', type=float, default=0.2, help='句间停顿秒数')
    ap.add_argument('--lead', type=float, default=0.3)
    ap.add_argument('--only', default='', help='只重做这些句号（从 1 数），如 3,7')
    a = ap.parse_args()
    from cosyvoice.cli.cosyvoice import AutoModel
    torch.set_num_threads(os.cpu_count() or 4)
    m = AutoModel(model_dir=ROOT + '/models/cv3')
    sr = m.sample_rate
    # 参考音统一成 24k 单声道
    y, r = sf.read(a.ref, dtype='float32', always_2d=True); y = y.mean(1)
    if r != 24000:
        import librosa; y = librosa.resample(y, orig_sr=r, target_sr=24000)
    os.makedirs(a.out + '/lines', exist_ok=True)
    ref = a.out + '/lines/_ref24k.wav'; sf.write(ref, y, 24000)
    pt = 'You are a helpful assistant.<|endofprompt|>' + a.ref_text
    lines = [l.strip() for l in open(a.script, encoding='utf-8') if l.strip()]
    only = {int(x) for x in a.only.split(',') if x.strip()}
    t0 = time.time()
    for i, line in enumerate(lines, 1):
        f = f'{a.out}/lines/{i:03d}.wav'
        if (only and i not in only) or (not only and os.path.exists(f)): continue
        seg = [j['tts_speech'][0] for j in m.inference_zero_shot(line, pt, ref, stream=False, speed=a.speed)]
        s = torch.cat(seg).numpy()
        nz = np.where(np.abs(s) > 0.01)[0]
        if len(nz): s = s[max(0, nz[0] - int(.02 * sr)): nz[-1] + int(.05 * sr)]
        sf.write(f, s, sr)
        print(f'[{i}/{len(lines)}] {time.time()-t0:.0f}s  {line}', file=sys.stderr, flush=True)
    chunks = [np.zeros(int(a.lead * sr), np.float32)]; t = a.lead; sents = []
    for i, line in enumerate(lines, 1):
        s, _ = sf.read(f'{a.out}/lines/{i:03d}.wav', dtype='float32')
        sents.append({'text': line, 'start': round(t, 3), 'end': round(t + len(s) / sr, 3)})
        chunks += [s, np.zeros(int(a.gap * sr), np.float32)]; t += len(s) / sr + int(a.gap * sr) / sr
    v = np.concatenate(chunks); v = v / max(1e-6, np.abs(v).max()) * 0.89
    sf.write(a.out + '/voice.wav', v, sr)
    json.dump({'duration': round(len(v) / sr, 3), 'sentences': sents}, open(a.out + '/voice.json', 'w'), ensure_ascii=False, indent=1)
    print('done', a.out + '/voice.wav', round(len(v) / sr, 1), 's', file=sys.stderr)

if __name__ == '__main__':
    main()

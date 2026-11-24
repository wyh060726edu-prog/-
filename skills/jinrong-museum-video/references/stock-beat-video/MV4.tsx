// 英伟达 · 纯音乐卡点片 v4（竖屏 1080×1920，60fps）
// 学恒指走势参考片：镜头跟线头、火花、烟花、整数关口线、见顶拉远、闪电、碎玻璃；加小Lin说 L01/L02/L04/L05/L12 手法
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, random} from 'remotion';
import {loadFonts} from '../kit/Caption';
import {k01, outq} from '../lin/lin';
import D from './data.json';
import DD from './d4.json';
import FB from './fever_beats.json';

const FPS = 60;
const s2f = (s: number) => Math.round(s * FPS);
const MS = 87.4; // 音乐起点（秒）：1:51.39 的大爆点 = 视频 24.0 秒
const mt = (songSec: number) => Math.round((songSec - MS) * 60);
export const MV4_END = mt(144.0);
const UP = '#ff3b3b', DN = '#1fd17a', GOLD = '#ffc94a', BG = '#030407', CYAN = '#8fe9ff';
const sh = '0 4px 16px rgba(0,0,0,0.95)';
const W = 1080, H = 1920;

type Row = [string, number, number, number, number];
const DAY = DD as Row[];
const N = DAY.length;
const idx = (d: string) => DAY.findIndex((r) => r[0] === d);
const IPEAK = idx('2026-10-06'), I20 = idx('2026-11-20');
const HIGH = 239.24, PREV = D.nvda_prev as number;
const cap = (p: number) => (p * 0.0243).toFixed(2);
const inoutc = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ---------- 时间轴（秒，每根日 K 落在一个节拍上） ----------
const BEATS = (FB as number[]).filter((x) => x >= MS);
const iB = (t: number) => BEATS.reduce((bi, x, i) => (Math.abs(x - t) < Math.abs(BEATS[bi] - t) ? i : bi), 0);
const B20 = iB(106.6); // 11/20 落在 1:46.6
const LANDS: number[] = Array.from({length: I20 - IPEAK + 1}, (_, k) => mt(BEATS[B20 - (I20 - IPEAK) + k])); // 每根日 K 落在一个节拍上
const TPEAK = LANDS[0], T1 = LANDS[LANDS.length - 1], T2 = mt(111.39), T5 = mt(119.07), TEND = mt(134.44);
const DIVE0 = mt(108.3), DIVE1 = mt(110.9);
const TR = T2 + s2f(1.8); // 火箭段结束
const T3 = mt(117.4); // 分时画到 12:00
const TG = T5 - s2f(1.15); // 九宫格出现
const ONSETS = [111.39 + 1.95 * 1, 111.39 + 1.95 * 2, 111.39 + 1.95 * 3, 121.0, 122.93, 124.88, 126.76, 128.68, 130.6, 132.52].map(mt);
const headAt = (f: number) => {
  let h = IPEAK;
  for (let k = 0; k < LANDS.length; k++) {
    const g = k === LANDS.length - 1 ? 15 : 6;
    if (f >= LANDS[k]) h = IPEAK + k + 1;
    else if (f >= LANDS[k] - g) { h = IPEAK + k + outq((f - LANDS[k] + g) / g); break; } else break;
  }
  return h;
};
const wcAt = (f: number) => 22 + (I20 + 5 - IPEAK - 22) * inoutc(k01(f, T1 + 8, 30));
const HX = 790, CL = 40, CT = 720, CB = 1290;
// 抖音安全区（v5）：上 230 以下、下 1330 以上；左右各裁约 56px；y>1000 时右侧 890 以外是按钮栏
const rangeRaw = (head: number, wc: number) => {
  const a = Math.max(0, Math.floor(head - wc)), b = Math.min(N - 1, Math.floor(head));
  let lo = Infinity, hi = -Infinity;
  for (let i = a; i <= b; i++) { lo = Math.min(lo, DAY[i][3]); hi = Math.max(hi, DAY[i][2]); }
  const pad = (hi - lo) * 0.12 + 2;
  return [lo - pad, hi + pad];
};
const rangeAt = (f: number) => {
  let lo = 0, hi = 0;
  const S = [0, 6, 12, 18];
  for (const d of S) { const [a, b] = rangeRaw(headAt(f - d), wcAt(f - d)); lo += a; hi += b; }
  return [lo / S.length, hi / S.length];
};
const camAtDaily = (f: number) => {
  const head = headAt(f), wc = wcAt(f), [lo, hi] = rangeAt(f);
  const cw = (HX - CL) / wc;
  const x = (i: number) => HX - (head - i - 0.5) * cw;
  const y = (v: number) => CB - ((v - lo) / (hi - lo)) * (CB - CT);
  return {head, wc, cw, x, y, lo, hi};
};
const curClose = (head: number) => {
  const i = Math.min(N - 1, Math.max(0, Math.ceil(head) - 1));
  const fr = Math.max(0, Math.min(1, head - i));
  const [, o, , , c] = DAY[i];
  return o + (c - o) * fr;
};
const headScreen = (f: number) => {
  const c = camAtDaily(f);
  return [HX, c.y(curClose(c.head))];
};
// 整数关口（第一次收盘跌破）
const LEVELS = [225, 200, 175].map((lv) => {
  const i = DAY.findIndex((r, j) => j > IPEAK && r[4] < lv);
  return {lv, i, fr: LANDS[i - IPEAK]};
});

// ---------- 通用特效 ----------
const Sparks: React.FC<{f: number; from: number; to: number; pos: (f: number) => number[]; color: (f: number) => string; n?: number}> = ({f, from, to, pos, color, n = 36}) => {
  if (f < from || f > to + 40) return null;
  return <>{Array.from({length: n}, (_, j) => {
    const life = 22 + (j % 5) * 4;
    const age = (f + j * 7) % life;
    const sf = f - age;
    if (sf < from || sf > to) return null;
    const [x0, y0] = pos(sf);
    const ang = -Math.PI / 2 + (random(`sa${j}${sf}`) - 0.5) * 2.6;
    const sp = 3 + random(`sv${j}${sf}`) * 7;
    const x = x0 + Math.cos(ang) * sp * age - 1.2 * age, y = y0 + Math.sin(ang) * sp * age + 0.09 * age * age;
    const o = 1 - age / life;
    return <circle key={j} cx={x} cy={y} r={1.5 + 2.5 * o} fill={j % 4 === 0 ? '#fff' : color(sf)} opacity={o} />;
  })}</>;
};
const Firework: React.FC<{f: number; at: number; x: number; y: number; c: string; n?: number; big?: number}> = ({f, at, x, y, c, n = 90, big = 1}) => {
  const age = f - at;
  if (age < 0 || age > 70) return null;
  return <>{Array.from({length: n}, (_, j) => {
    const ang = random(`fa${at}${j}`) * Math.PI * 2;
    const sp = (4 + random(`fs${at}${j}`) * 11) * big;
    const t = age * (1 - age / 160);
    const px = x + Math.cos(ang) * sp * t, py = y + Math.sin(ang) * sp * t + 0.05 * age * age;
    const o = Math.max(0, 1 - age / (45 + (j % 4) * 7));
    return <g key={j} opacity={o}>
      <line x1={px} y1={py} x2={px - Math.cos(ang) * sp * 1.6} y2={py - Math.sin(ang) * sp * 1.6} stroke={j % 3 ? c : '#fff'} strokeWidth={2.4} />
      <circle cx={px} cy={py} r={2.2} fill={j % 3 ? c : '#fff'} />
    </g>;
  })}</>;
};
const boltPts = (seed: string, x0: number, y0: number, x1: number, y1: number, depth = 6) => {
  let pts: [number, number][] = [[x0, y0], [x1, y1]];
  let amp = Math.abs(y1 - y0) * 0.22;
  for (let d = 0; d < depth; d++) {
    const nx: [number, number][] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      nx.push([ax, ay], [(ax + bx) / 2 + (random(`${seed}${d}${i}`) - 0.5) * amp, (ay + by) / 2]);
    }
    nx.push(pts[pts.length - 1]);
    pts = nx; amp *= 0.55;
  }
  return pts;
};
const Lightning: React.FC<{f: number; at: number; x: number; y: number; big?: number}> = ({f, at, x, y, big = 1}) => {
  const age = f - at;
  if (age < -2 || age > 34) return null;
  const on = age < 0 ? 0.6 : age < 6 ? 1 : age < 9 ? 0.15 : age < 15 ? 0.95 : Math.max(0, 1 - (age - 15) / 18);
  const main = boltPts(`L${at}`, x + 260 * big * (random(`lx${at}`) - 0.3), -40, x, y);
  const br = [0.35, 0.55, 0.7].map((t, k) => {
    const p = main[Math.floor(t * (main.length - 1))];
    return boltPts(`B${at}${k}`, p[0], p[1], p[0] + (k % 2 ? 1 : -1) * (120 + 80 * k) * big, p[1] + 180 + 60 * k, 4);
  });
  const d = (ps: [number, number][]) => ps.map(([a, b], i) => (i ? 'L' : 'M') + a.toFixed(1) + ',' + b.toFixed(1)).join(' ');
  return <g opacity={on}>
    {[main, ...br].map((ps, k) => <g key={k}>
      <path d={d(ps)} fill="none" stroke={CYAN} strokeWidth={(k ? 8 : 18) * big} filter="url(#bl12)" opacity={0.9} />
      <path d={d(ps)} fill="none" stroke="#fff" strokeWidth={(k ? 2 : 5) * big} />
    </g>)}
    <circle cx={x} cy={y} r={60 * big} fill="#fff" opacity={0.7 * Math.max(0, 1 - age / 12)} filter="url(#bl12)" />
  </g>;
};
const Shatter: React.FC<{f: number; at: number; x: number; y: number; n?: number}> = ({f, at, x, y, n = 30}) => {
  const age = f - at;
  if (age < 0 || age > 70) return null;
  return <>{Array.from({length: n}, (_, j) => {
    const ang = random(`ha${at}${j}`) * Math.PI * 2, sp = 6 + random(`hs${at}${j}`) * 16;
    const r = 18 + random(`hr${at}${j}`) * 46;
    const px = x + Math.cos(ang) * sp * age * (1 - age / 200), py = y + Math.sin(ang) * sp * age * (1 - age / 200) + 0.06 * age * age;
    const rot = (random(`ht${at}${j}`) - 0.5) * 14 * age;
    const pts = [0, 1, 2].map((k) => { const a = random(`hp${at}${j}${k}`) * Math.PI * 2; return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ');
    return <polygon key={j} points={pts} transform={`translate(${px},${py}) rotate(${rot})`} fill="rgba(200,240,255,0.10)" stroke="rgba(230,250,255,0.85)" strokeWidth={1.6} opacity={Math.max(0, 1 - age / 66)} />;
  })}</>;
};
const Flash: React.FC<{f: number; at: number; c: string; d?: number; o?: number}> = ({f, at, c, d = 16, o = 0.6}) => {
  if (f < at || f > at + d) return null;
  return <AbsoluteFill style={{background: c, opacity: o * (1 - (f - at) / d), mixBlendMode: 'screen'}} />;
};
const Defs: React.FC = () => <defs>
  <filter id="bl6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
  <filter id="bl12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
  <linearGradient id="cu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={UP} stopOpacity={0.2} /><stop offset="1" stopColor={UP} stopOpacity={0} /></linearGradient>
  <linearGradient id="cd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={DN} stopOpacity={0.2} /><stop offset="1" stopColor={DN} stopOpacity={0} /></linearGradient>
</defs>;

// ---------- 背景：星点 + 网格 ----------
const Stars: React.FC<{f: number}> = ({f}) => <svg width={W} height={H} style={{position: 'absolute'}}>
  {Array.from({length: 90}, (_, j) => {
    const x = ((random(`stx${j}`) * W - f * (0.3 + random(`stv${j}`) * 0.8)) % W + W) % W;
    return <circle key={j} cx={x} cy={random(`sty${j}`) * H} r={0.8 + random(`str${j}`) * 1.4} fill="#fff" opacity={0.15 + 0.35 * Math.abs(Math.sin(f / 40 + j))} />;
  })}
  {Array.from({length: 12}, (_, j) => <line key={'g' + j} x1={0} x2={W} y1={j * 170} y2={j * 170} stroke="rgba(255,255,255,0.035)" />)}
</svg>;

// ---------- 段 A/B：日 K 跟线 ----------
const EVENTS: {d: string; at: number; date: string; title: string; sub: string; c: string; face?: boolean}[] = [
  {d: '2026-11-09', at: LANDS[idx('2026-11-09') - IPEAK], date: '2026.11.08', title: '私人风波', sub: '本人承认私生活风波', c: CYAN},
  {d: '2026-11-12', at: LANDS[idx('2026-11-12') - IPEAK], date: '2026.11.12', title: '辞去 CEO', sub: '财务总监临时接任', c: CYAN, face: true},
  {d: '2026-11-17', at: LANDS[idx('2026-11-17') - IPEAK], date: '2026.11.17', title: '董事会：不让他回来', sub: '"不打算让他复职"', c: CYAN},
];
const Daily: React.FC<{f: number}> = ({f}) => {
  if (f > DIVE1 + 4) return null;
  const c = camAtDaily(f);
  const a = Math.max(0, Math.floor(c.head - c.wc - 2)), b = Math.min(N - 1, Math.floor(c.head));
  const dk = k01(f, DIVE0, DIVE1 - DIVE0);
  const z = Math.pow(45, dk * dk);
  const sx = c.x(I20 + 1), sy = c.y(150);
  const tx = (540 - sx) * Math.min(1, dk * 1.5), ty = (1000 - sy) * Math.min(1, dk * 1.5);
  const candles = [];
  for (let i = a; i <= b; i++) {
    const [, o, h, l, cl] = DAY[i];
    const pr = Math.max(0, Math.min(1, c.head - i));
    if (pr <= 0) continue;
    const cc = o + (cl - o) * pr, hh = Math.max(o, cc, o + (h - o) * pr), ll = Math.min(o, cc, o + (l - o) * pr);
    const up = cc >= o, col = up ? UP : DN;
    const X = c.x(i), y1 = c.y(Math.max(o, cc)), y2 = c.y(Math.min(o, cc));
    const bw = Math.max(1.5, c.cw * 0.66);
    candles.push(<g key={i} opacity={i < IPEAK ? 0.28 : 1}>
      <rect x={X - bw / 2} y={y2} width={bw} height={CB + 300 - y2} fill={`url(#${up ? 'cu' : 'cd'})`} />
      <line x1={X} x2={X} y1={c.y(hh)} y2={c.y(ll)} stroke={col} strokeWidth={Math.max(1, Math.min(3, c.cw * 0.12))} />
      <rect x={X - bw / 2} y={y1} width={bw} height={Math.max(2, y2 - y1)} fill={col} />
    </g>);
  }
  const hy = c.y(curClose(c.head));
  const isDown = (ff: number) => { const h = headAt(ff); const i = Math.min(N - 1, Math.max(0, Math.ceil(h) - 1)); return curClose(h) < DAY[i][1]; };
  const o = k01(f, 0, 10) * (1 - k01(f, DIVE1 - 8, 12));
  const peakX = c.x(IPEAK), peakY = c.y(HIGH);
  const showPeak = f >= TPEAK - 2;
  return <AbsoluteFill style={{opacity: o}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${tx}px,${ty}px) scale(${z})`, transformOrigin: `${sx}px ${sy}px`}}>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <Defs />
        {/* 价格刻度 */}
        {Array.from({length: 8}, (_, k) => {
          const step = c.hi - c.lo > 80 ? 25 : 10;
          const v = Math.ceil(c.lo / step) * step + k * step;
          if (v > c.hi) return null;
          return <g key={v}><line x1={0} x2={W} y1={c.y(v)} y2={c.y(v)} stroke="rgba(255,255,255,0.06)" /><text x={W - 20} y={c.y(v) - 8} textAnchor="end" fontFamily="NSans" fontSize={24} fill="rgba(255,255,255,0.35)">{v}</text></g>;
        })}
        {/* 整数关口线 */}
        {LEVELS.map(({lv, fr}) => {
          const age = f - fr;
          if (fr <= 0 || age < 0 || age > 80) return null;
          const k = outq(k01(age, 0, 10)), oo = 1 - k01(age, 50, 30);
          return <g key={lv} opacity={oo}>
            <line x1={W * (1 - k)} x2={W} y1={c.y(lv)} y2={c.y(lv)} stroke={DN} strokeWidth={3} filter="url(#bl6)" />
            <line x1={W * (1 - k)} x2={W} y1={c.y(lv)} y2={c.y(lv)} stroke={DN} strokeWidth={2} />
          </g>;
        })}
        <g filter="url(#bl6)" opacity={0.75}>{candles}</g>
        <g>{candles}</g>
        {/* 见顶：放大镜气泡钉在高点 */}
        {showPeak && f < TPEAK + s2f(2.7) && <g opacity={k01(f, TPEAK - 2, 8) * (1 - k01(f, TPEAK + s2f(2.1), 30))}>
          <circle cx={peakX} cy={peakY} r={46} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.7)" strokeWidth={2} />
          <circle cx={peakX} cy={peakY} r={9} fill={GOLD} />
          <text x={peakX - 60} y={peakY - 60} textAnchor="end" fontFamily="NSans" fontWeight={700} fontSize={34} fill={GOLD} stroke="#000" strokeWidth={6} paintOrder="stroke">10.06 新高 239.24</text>
        </g>}
        {/* 事件钉（L05） */}
        {EVENTS.map((e) => {
          const i = idx(e.d);
          if (f < e.at - 2) return null;
          const X = c.x(i), Y = c.y(DAY[i][3]);
          return <g key={e.d} opacity={k01(f, e.at - 2, 6) * (1 - k01(f, T1 + 30, 20))}>
            <line x1={X} x2={X} y1={Y + 10} y2={CB + 40} stroke="rgba(255,255,255,0.5)" strokeDasharray="5 5" />
            <circle cx={X} cy={Y + 10} r={6} fill="#fff" />
          </g>;
        })}
        {/* 单日暴跌竖条（L04） */}
        {f >= T1 - 4 && <rect x={c.x(I20) - c.cw * 0.6} y={CT - 40} width={c.cw * 1.2} height={CB - CT + 80} fill={DN} opacity={0.22 * k01(f, T1 - 4, 6)} />}
        {/* 火花 */}
        {f < T1 + 40 && <Sparks f={f} from={TPEAK - 6} to={Math.min(T1, DIVE0)} pos={headScreen} color={(ff) => (isDown(ff) ? DN : UP)} />}
        <circle cx={HX} cy={hy} r={22} fill={isDown(f) ? DN : UP} opacity={0.7} filter="url(#bl12)" />
        <circle cx={HX} cy={hy} r={8} fill="#fff" />
        {LEVELS.map(({lv, fr}) => <Firework key={'fw' + lv} f={f} at={fr} x={HX} y={c.y(lv)} c={DN} n={60} big={0.8} />)}
        <Firework f={f} at={TPEAK} x={peakX} y={peakY} c={UP} n={130} big={1.3} />
        <Lightning f={f} at={EVENTS[1].at} x={c.x(idx('2026-11-12'))} y={c.y(DAY[idx('2026-11-12')][3])} big={0.7} />
        <Shatter f={f} at={EVENTS[1].at} x={c.x(idx('2026-11-12'))} y={c.y(DAY[idx('2026-11-12')][3])} n={18} />
        <Lightning f={f} at={T1} x={HX} y={c.y(DAY[I20][4])} big={1.2} />
        <Shatter f={f} at={T1} x={HX} y={c.y(DAY[I20][4])} n={34} />
      </svg>
      {/* 关口大数字 */}
      {LEVELS.map(({lv, fr}) => {
        const age = f - fr;
        if (fr <= 0 || age < 0 || age > 70) return null;
        return <div key={'n' + lv} style={{position: 'absolute', left: 70, top: c.y(lv) + 20, fontFamily: 'NSans', fontWeight: 700, fontSize: 110, color: DN, opacity: k01(age, 0, 4) * (1 - k01(age, 45, 25)), transform: `scale(${1.5 - 0.5 * outq(k01(age, 0, 10))})`, transformOrigin: 'left center', textShadow: `0 0 30px rgba(31,209,122,0.8), ${sh}`}}>跌破 {lv}</div>;
      })}
      {f >= DIVE0 - 20 && <div style={{position: 'absolute', left: c.x(I20 + 1) - c.cw * 0.5, top: c.y(175), width: c.cw, height: c.y(125) - c.y(175), border: `2px dashed ${GOLD}`, opacity: k01(f, DIVE0 - 20, 10), display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontFamily: 'NSans', fontWeight: 700, fontSize: 28}}>?</div>}
    </div>
    {/* 事件卡 */}
    {EVENTS.map((e, k) => {
      const nxt = k < EVENTS.length - 1 ? EVENTS[k + 1].at : T1 - 6;
      if (f < e.at - 2 || f > nxt + 6) return null;
      const o2 = k01(f, e.at - 2, 6) * (1 - k01(f, nxt - 2, 8));
      return <div key={e.d} style={{position: 'absolute', left: 70, top: 540, maxWidth: 820, padding: '14px 24px', borderRadius: 20, background: 'rgba(3,4,7,0.78)', display: 'flex', gap: 24, alignItems: 'center', fontFamily: 'NSans', opacity: o2, transform: `translateY(${20 * (1 - outq(k01(f, e.at - 2, 10)))}px)`}}>
        {e.face && <Img src={staticFile('wm/huang2.jpg')} style={{width: 150, height: 150, borderRadius: 75, objectFit: 'cover', filter: 'grayscale(1)', border: '4px solid rgba(255,255,255,0.8)'}} />}
        <div>
          <div style={{fontSize: 30, color: '#bbb', fontWeight: 500}}>{e.date}</div>
          <div style={{fontSize: 72, color: e.c, fontWeight: 700, textShadow: sh}}>{e.title}</div>
          <div style={{fontSize: 34, color: '#eee', fontWeight: 500}}>{e.sub}</div>
        </div>
      </div>;
    })}
    {/* 11/20 大跌（L01 巨型跌幅 + L04 徽章） */}
    {f >= T1 && f < DIVE0 && <div style={{position: 'absolute', left: 70, top: 540, padding: '10px 24px', borderRadius: 20, background: 'rgba(3,4,7,0.7)', fontFamily: 'NSans', opacity: 1 - k01(f, DIVE0 - 16, 16)}}>
      <div style={{display: 'inline-block', background: DN, color: '#000', fontWeight: 700, fontSize: 40, padding: '4px 18px', borderRadius: 8, transform: `scale(${1.4 - 0.4 * outq(k01(f, T1, 10))})`, transformOrigin: 'left'}}>11.20 单日 −14.0%</div>
      <div style={{fontWeight: 700, fontSize: 150, color: DN, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', textShadow: '0 0 50px rgba(31,209,122,0.7)', transform: `scale(${1.6 - 0.6 * outq(k01(f, T1, 12))})`, transformOrigin: 'left'}}>−47.5%</div>
      <div style={{fontWeight: 700, fontSize: 40, color: '#fff', textShadow: sh}}>较 10.06 高点 · 一周蒸发 9010 亿美元</div>
    </div>}
    {f >= DIVE0 && <div style={{position: 'absolute', left: 0, right: 0, top: 590, padding: '10px 0', background: 'rgba(3,4,7,0.8)', zIndex: 5, textAlign: 'center', fontFamily: 'NSans', fontWeight: 700, fontSize: 62, color: GOLD, textShadow: sh, opacity: k01(f, DIVE0, 10)}}>11月23日 · 周一 · 美东 4:00</div>}
  </AbsoluteFill>;
};

// ---------- 顶部 HUD ----------
const MIN = D.nvda_p as [number, number, number][];
const NEWS = D.news_m as number, OPENM = D.open_m as number, LM = 480;
const priceAt = (m: number) => {
  const i = MIN.findIndex((q) => q[0] > m);
  if (i <= 0) return i === 0 ? MIN[0][1] : MIN[MIN.length - 1][1];
  const [m0, v0] = MIN[i - 1], [m1, v1] = MIN[i];
  return v0 + (v1 - v0) * ((m - m0) / (m1 - m0));
};
const M_ROCK = 345;
const TA = DIVE1 - s2f(0.3);
const mAt = (f: number) => {
  if (f < T2) return k01(f, TA, T2 - TA - 2) * (NEWS - 0.5);
  if (f < TR) return NEWS + (M_ROCK - NEWS) * Math.pow(k01(f, T2, TR - T2), 1.15);
  return M_ROCK + (LM - M_ROCK) * outq(k01(f, TR, T3 - TR));
};
const TOPEN = T2 + Math.ceil((TR - T2) * Math.pow((330 - NEWS) / (M_ROCK - NEWS), 1 / 1.15));
const tm = (mm: number) => { const t = 240 + Math.floor(mm); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
const HUD: React.FC<{f: number}> = ({f}) => {
  if (f > TG + 10) return null;
  let p: number, date: string, sub: string, gold = false;
  if (f < DIVE1) {
    const h = headAt(f); const i = Math.min(N - 1, Math.max(0, Math.ceil(h) - 1));
    p = curClose(h); date = DAY[i][0].replace(/-/g, '.');
    gold = f >= TPEAK - 6 && f < TPEAK + s2f(1.5);
    sub = '日线';
  } else { p = priceAt(mAt(f)); date = `2026.11.23 · 美东 ${tm(mAt(f))}`; sub = '分时'; }
  const vsH = (p / HIGH - 1) * 100;
  const hh = headAt(f), ii = Math.min(N - 1, Math.max(0, Math.ceil(hh) - 1));
  const chg = f < DIVE1 ? (p / DAY[Math.max(0, ii - 1)][4] - 1) * 100 : (p / PREV - 1) * 100;
  const col = gold ? GOLD : f < DIVE1 ? (chg >= 0 ? UP : DN) : UP;
  return <div style={{position: 'absolute', left: 70, top: 225, fontFamily: 'NSans', opacity: k01(f, 0, 10) * (1 - k01(f, TG, 10))}}>
    <div style={{fontSize: 30, color: '#9aa4ae', fontWeight: 500}}>英伟达 NVDA · {sub} <span style={{color: '#666'}}>| 金融博物馆</span></div>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
      <span style={{fontSize: 150, fontWeight: 700, color: col, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 30px ${col}55`}}>{p.toFixed(2)}</span>
      {gold && <span style={{fontSize: 40, fontWeight: 700, color: '#000', background: GOLD, padding: '2px 12px', borderRadius: 6}}>见顶</span>}
    </div>
    <div style={{fontSize: 40, color: '#fff', fontWeight: 700, marginTop: -10}}>{date}</div>
    <div style={{position: 'absolute', left: 590, top: 50, width: 360, fontSize: 28, color: '#ccc', lineHeight: 1.5}}>
      <div>{f < DIVE1 ? '当日' : '较上周五收盘'} <b style={{color: chg >= 0 ? UP : DN}}>{chg >= 0 ? '▲' : '▼'}{Math.abs(chg).toFixed(1)}%</b></div>
      <div>较 10.06 高点 <b style={{color: vsH >= 0 ? UP : DN}}>{vsH >= 0 ? '▲' : '▼'}{Math.abs(vsH).toFixed(1)}%</b></div>
      <div>市值 <b style={{color: '#fff'}}>{cap(p)} 万亿美元</b></div>
    </div>
  </div>;
};

// ---------- 段 C/D：分时 + 火箭跟线 ----------
const CX = 70, CWd = 930, CY = 600, CH = 500, LOv = 122, HIv = 176;
const px = (m: number) => CX + (m / LM) * CWd;
const py = (v: number) => CY + CH - ((v - LOv) / (HIv - LOv)) * CH;
const camI = (f: number) => {
  const zin = outq(k01(f, T2 - 4, 10)), zout = k01(f, TR, 34);
  const w = zin * (1 - zout * zout * (3 - 2 * zout));
  const S = 1 + 2.2 * w;
  const m = mAt(f), hx = px(m), hy = py(priceAt(m));
  const P0 = [540, 850], FT = [430, 1020];
  return {w, S, c: [P0[0] + (hx - P0[0]) * w, P0[1] + (hy - P0[1]) * w], F: [P0[0] + (FT[0] - P0[0]) * w, P0[1] + (FT[1] - P0[1]) * w]};
};
const Intraday: React.FC<{f: number}> = ({f}) => {
  if (f < TA || f > TG + 12) return null;
  const o = k01(f, TA, 14) * (1 - k01(f, TG, 12));
  const m = mAt(f), p = priceAt(m), pct = (p / PREV - 1) * 100;
  const live = f >= T2;
  const {w, S, c, F} = camI(f);
  const nShow = Math.max(1, MIN.findIndex((q) => q[0] > m));
  const pts = MIN.slice(0, nShow).map(([mm, v]) => [px(mm), py(v)]).concat([[px(m), py(p)]]);
  const path = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
  const area = path + ` L${px(m).toFixed(1)},${CY + CH} L${CX},${CY + CH} Z`;
  const hy = py(p);
  const clouds = [146, 157, 166].flatMap((lvl, li) => Array.from({length: 6}, (_, j) => ({lvl, li, j, x0: px(296 + j * 8 + li * 3) + (random(`cx${li}${j}`) - 0.5) * 40, r: 30 + random(`cr${li}${j}`) * 30})));
  const iS = 1 / Math.sqrt(S);
  const seed = Math.floor(f / 2);
  const tape = Array.from({length: 6}, (_, i) => {
    const s = Math.floor(f / 4) - i;
    const big = random(`big${s}`) > 0.5;
    return {s, big, vol: big ? Math.round(20000 + random(`v${s}`) * 120000) : Math.round(100 + random(`v${s}`) * 2000), px: p + (random(`p${s}`) - 0.5) * 0.08};
  });
  const L: [string, number, number][] = [['纳斯达克', D.ixic_prev, D.ixic_px], ['标普500', D.spx_prev, D.spx_px], ['道琼斯', D.dji_prev, D.dji_px]];
  const ik = outq(k01(f, T2 + 6, T3 - T2 - 6));
  return <AbsoluteFill style={{opacity: o}}>
    {/* 底部：三大指数 + 逐笔（示意） */}
    <div style={{position: 'absolute', left: 70, right: 190, top: 1140, display: 'flex', gap: 14, fontFamily: 'NSans'}}>
      {L.map(([n, p0, p1]) => { const v = p0 + (p1 - p0) * (live ? ik : 0), pc = (v / p0 - 1) * 100; return <div key={n} style={{flex: 1, background: '#0d1117', border: `2px solid ${live ? UP : '#222'}`, borderRadius: 12, padding: '10px 14px'}}>
        <div style={{fontSize: 28, color: '#ccc', fontWeight: 700}}>{n}</div>
        <div style={{fontSize: 40, fontWeight: 700, color: live ? UP : '#ccc', fontVariantNumeric: 'tabular-nums'}}>{v.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
        <div style={{fontSize: 32, fontWeight: 700, color: '#fff', background: live ? UP : '#333', display: 'inline-block', padding: '0 10px', borderRadius: 6}}>{pc >= 0 ? '+' : ''}{pc.toFixed(2)}%</div>
      </div>; })}
    </div>
    <div style={{display: 'none', position: 'absolute', left: 40, right: 40, top: 1640, fontFamily: 'monospace', fontSize: 28}}>
      <div style={{fontFamily: 'NSans', fontWeight: 700, fontSize: 28, color: '#fff', marginBottom: 4}}>逐笔成交（示意）</div>
      {tape.slice(0, 4).map((t, i) => <div key={t.s} style={{display: 'flex', justifyContent: 'space-between', padding: '2px 12px', background: live && t.big ? `rgba(255,59,59,${0.55 - i * 0.1})` : 'transparent', color: live ? UP : '#aaa', fontWeight: t.big ? 700 : 400}}>
        <span>{t.px.toFixed(2)}</span><span style={{color: '#fff'}}>{t.vol.toLocaleString()}{live && t.big ? ' 大单买' : ''}</span></div>)}
    </div>
    <div style={{position: 'absolute', left: 70, top: 1306, fontFamily: 'NSans', fontSize: 20, color: 'rgba(255,255,255,0.5)'}}>Yahoo Finance 1 分钟分时（美东 4:00–12:00） {seed < 0 ? '' : ''}</div>
    {/* 分时图层：火箭段铺满全屏 */}
    <div style={{position: 'absolute', inset: 0, clipPath: `inset(${(CY - 60) * (1 - w)}px 0px ${(H - CY - CH - 50) * (1 - w)}px 0px)`}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 65%, rgb(95,10,10), rgb(3,4,7))', opacity: w}} />
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <Defs />
        <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={UP} stopOpacity={0.5} /><stop offset="1" stopColor={UP} stopOpacity={0} /></linearGradient></defs>
        <g transform={`translate(${F[0]},${F[1]}) scale(${S}) translate(${-c[0]},${-c[1]})`}>
          {[130, 140, 150, 160, 170].map((v) => <g key={v}><line x1={CX} x2={CX + CWd} y1={py(v)} y2={py(v)} stroke="rgba(255,255,255,0.07)" /><text x={CX + CWd - 4} y={py(v) - 6} textAnchor="end" fontFamily="NSans" fontSize={22} fill="rgba(255,255,255,0.4)">{v}</text></g>)}
          <line x1={CX} x2={CX + CWd} y1={py(PREV)} y2={py(PREV)} stroke="rgba(255,255,255,0.35)" strokeDasharray="8 6" />
          <text x={CX + 6} y={py(PREV) + 30} fontFamily="NSans" fontSize={22} fill="rgba(255,255,255,0.6)">上周五收盘 125.53</text>
          <rect x={CX} y={CY} width={px(OPENM) - CX} height={CH} fill="rgba(255,255,255,0.03)" />
          <line x1={px(OPENM)} x2={px(OPENM)} y1={CY} y2={CY + CH} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 6" />
          <text x={px(OPENM) + 6} y={CY + CH - 12} fontFamily="NSans" fontSize={20} fill="rgba(255,255,255,0.6)">9:30 开盘</text>
          {live && clouds.map(({lvl, li, j, x0, r}) => {
            const cy0 = py(lvl), passed = Math.max(0, cy0 - hy);
            const op = w * 0.32 * Math.max(0, 1 - passed / 80);
            if (op <= 0.01) return null;
            const side = x0 < px(m) ? -1 : 1;
            return <ellipse key={`c${li}${j}`} cx={x0 + side * passed * 3} cy={cy0 + passed * 0.3} rx={r * 1.1} ry={r * 0.45} fill="#e9eef5" opacity={op} filter="url(#bl12)" />;
          })}
          {live && <path d={area} fill="url(#ar)" />}
          {live && <path d={path} fill="none" stroke={UP} strokeWidth={20 * iS} filter="url(#bl6)" />}
          <path d={path} fill="none" stroke={live ? (w > 0.3 ? '#fff0ea' : UP) : '#cfd6dd'} strokeWidth={(live ? 6 : 4) * iS} strokeLinejoin="round" />
          {live && <line x1={px(NEWS)} x2={px(NEWS)} y1={CY} y2={CY + CH} stroke={GOLD} strokeWidth={2} strokeDasharray="6 6" />}
          {live && <text x={px(NEWS) - 8} y={CY + 30} textAnchor="end" fontFamily="NSans" fontWeight={700} fontSize={22} fill={GOLD}>8:55 消息</text>}
          {live && m > OPENM && <text x={px(OPENM) - 10} y={py(167.04) - 14} textAnchor="end" fontFamily="NSans" fontWeight={700} fontSize={26 * iS} fill={UP} stroke="#000" strokeWidth={5 * iS} paintOrder="stroke">开盘 167.04</text>}
          <Sparks f={f} from={T2} to={TR + 10} n={30} pos={(ff) => { const mm = mAt(ff); return [px(mm), py(priceAt(mm))]; }} color={() => GOLD} />
          <circle cx={px(m)} cy={hy} r={(30 + 8 * Math.sin(f / 4)) * iS} fill={live ? UP : '#cfd6dd'} opacity={0.6} filter="url(#bl12)" />
          <circle cx={px(m)} cy={hy} r={10 * iS} fill="#fff" />
          <text x={CX} y={CY + CH + 34} fontFamily="NSans" fontSize={22} fill="rgba(255,255,255,0.5)">4:00</text>
          <text x={CX + CWd} y={CY + CH + 34} textAnchor="end" fontFamily="NSans" fontSize={22} fill="rgba(255,255,255,0.5)">12:00 美东</text>
        </g>
        {w > 0.02 && Array.from({length: 46}, (_, j) => {
          const x = random(`lx${j}`) * W, len = 140 + random(`ll${j}`) * 320;
          const y = ((random(`ly${j}`) * 2200 + f * (45 + random(`lv${j}`) * 40)) % 2400) - 400;
          return <line key={'l' + j} x1={x} x2={x} y1={y} y2={y + len} stroke={j % 4 ? 'rgba(255,255,255,0.35)' : 'rgba(255,140,110,0.6)'} strokeWidth={2 + (j % 3)} opacity={w} />;
        })}
        <Firework f={f} at={TOPEN} x={F[0]} y={F[1]} c={GOLD} n={120} big={1.4} />
      </svg>
      {w > 0.05 && <div style={{position: 'absolute', left: 70, top: F[1] - 380, fontFamily: 'NSans', fontWeight: 700, opacity: w}}>
        <div style={{fontSize: 140, color: f >= TOPEN ? UP : '#fff', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', fontVariantNumeric: 'tabular-nums', textShadow: `0 0 40px ${UP}`, transform: `scale(${1 + 0.3 * Math.max(0, 1 - Math.abs(f - TOPEN - 6) / 20)})`, transformOrigin: 'left bottom'}}>{f >= TOPEN - 2 && f < TOPEN + 32 ? '开盘 +33.1%' : `+${pct.toFixed(1)}%`}</div>
        <div style={{fontSize: 44, color: GOLD, textShadow: sh}}>美东 {tm(m)} · {p.toFixed(2)} 美元</div>
      </div>}
    </div>
    {/* 复任头像钉在 8:55（L05：灰 → 彩） */}
    {f > TR + 30 && <div style={{position: 'absolute', left: 70, top: CY + 30, display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'NSans', opacity: k01(f, TR + 30, 12), transform: `scale(${1.2 - 0.2 * outq(k01(f, TR + 30, 16))})`}}>
      <Img src={staticFile('wm/huang2.jpg')} style={{width: 120, height: 120, borderRadius: 60, objectFit: 'cover', border: `4px solid ${GOLD}`, boxShadow: `0 0 30px ${GOLD}`}} />
      <div><div style={{fontSize: 26, color: '#ccc'}}>美东 8:55</div><div style={{fontSize: 44, fontWeight: 700, color: GOLD, textShadow: sh}}>复任 CEO</div></div>
    </div>}
  </AbsoluteFill>;
};

const Push: React.FC<{f: number}> = ({f}) => {
  const a = T2 - 10;
  if (f < a || f > T2 + s2f(2.2)) return null;
  const s = outq(k01(f, a, 14)) + 0.06 * Math.sin(k01(f, a + 10, 14) * Math.PI);
  const out = k01(f, T2 + s2f(1.8), 20);
  return <div style={{position: 'absolute', left: 70, top: -260 + 500 * s - out * 620, width: 940, padding: '24px 28px', borderRadius: 40, background: 'rgba(236,236,240,0.95)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', display: 'flex', gap: 22, alignItems: 'center', fontFamily: 'NSans', boxSizing: 'border-box'}}>
    <div style={{width: 100, height: 100, borderRadius: 24, background: '#76b900', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 28, flexShrink: 0}}>NVDA</div>
    <div style={{flex: 1}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#666'}}><span>突发 · 英伟达公告</span><span>美东 8:55</span></div>
      <div style={{fontSize: 44, fontWeight: 700, color: '#111'}}>董事会：黄仁勋即刻复任 CEO</div>
      <div style={{fontSize: 28, color: '#333'}}>全票通过，复任总裁、首席执行官兼董事</div>
    </div>
  </div>;
};

// ---------- 段 E：九宫格 ----------
type GRow = [string, string, number, [number, number][]];
const GR = D.grid as unknown as GRow[];
const Grid9: React.FC<{f: number}> = ({f}) => {
  if (f < TG - 4 || f > TEND + 10) return null;
  const o = k01(f, TG - 4, 10) * (1 - k01(f, TEND, 10));
  const rev = f < T5 ? k01(f, TG, T5 - TG - 4) * (NEWS - 0.6) : f < T5 + 20 ? NEWS - 0.6 + (340 - NEWS) * outq(k01(f, T5, 20)) : 340 + 140 * k01(f, T5 + 20, TEND - T5 - 40);
  const live = f >= T5;
  const pop = live ? 1 + 0.08 * (1 - k01(f, T5, 20)) : 1;
  const beat = Math.max(0, ...ONSETS.map((b) => (f >= b ? 1 - (f - b) / 14 : 0)).map((x) => Math.max(0, x)));
  const X0 = 70, Y0 = 400, CW = 265, CHh = 300, GAP = 15;
  return <AbsoluteFill style={{background: BG, opacity: o}}>
    <div style={{position: 'absolute', left: 70, width: 820, top: 235, textAlign: 'center', fontFamily: 'NSans', fontWeight: 700}}>
      <div style={{fontSize: 40, color: '#aaa'}}>{live ? '同一时刻' : '回到美东 8:55'}</div>
      <div style={{fontSize: 66, color: live ? UP : '#fff', textShadow: sh}}>{live ? `一起跳涨 · 美东 ${tm(rev)}` : '黄仁勋复任消息发布'}</div>
    </div>
    {GR.map(([sym, name, pc, pts], i) => {
      const r = Math.floor(i / 3), cc = i % 3;
      const x = X0 + cc * (CW + GAP), y = Y0 + r * (CHh + GAP);
      const vals = pts.map((q) => q[1]).concat([pc]);
      const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.12;
      const L = 14, R = CW - 14, T = 112, Bt = CHh - 34;
      const gx = (mm: number) => L + (mm / 480) * (R - L);
      const gy = (v: number) => Bt - ((v - lo + pad) / (hi - lo + 2 * pad)) * (Bt - T);
      const seen = pts.filter((q) => q[0] <= rev);
      let last = seen[seen.length - 1];
      const nx = pts.find((q) => q[0] > rev);
      if (nx && last) { const t = (rev - last[0]) / (nx[0] - last[0]); last = [rev, last[1] + (nx[1] - last[1]) * t]; seen.push(last); }
      const d = seen.map(([mm, v], j) => (j ? 'L' : 'M') + gx(mm).toFixed(1) + ',' + gy(v).toFixed(1)).join(' ');
      const pct = (last[1] / pc - 1) * 100;
      const center = sym === 'NVDA';
      const isIdx = sym === 'IXIC' || sym === 'SPX' || sym === 'DJI';
      return <div key={sym} style={{position: 'absolute', left: x, top: y, width: CW, height: CHh, borderRadius: 16, background: live ? 'rgba(255,59,59,0.10)' : '#0b0f14', border: `3px solid ${live ? UP : center ? GOLD : '#222a33'}`, boxShadow: live ? `0 0 ${20 + 40 * (1 - k01(f, T5, 40)) + 24 * beat}px rgba(255,59,59,0.6)` : 'none', transform: `scale(${pop + 0.02 * beat})`, overflow: 'hidden', fontFamily: 'NSans'}}>
        <div style={{position: 'absolute', left: 14, top: 10, fontWeight: 700, fontSize: 32, color: center ? GOLD : '#fff'}}>{name}</div>
        <div style={{position: 'absolute', left: 14, top: 56, fontWeight: 700, fontSize: 28, color: live ? UP : '#ccc', fontVariantNumeric: 'tabular-nums'}}>{last[1].toLocaleString('en-US', {maximumFractionDigits: last[1] > 1000 ? 0 : 2, minimumFractionDigits: last[1] > 1000 ? 0 : 2})}</div>
        <div style={{position: 'absolute', right: 10, top: 54, fontWeight: 700, fontSize: 32, color: '#fff', background: live ? UP : '#333', padding: '0 10px', borderRadius: 8, fontVariantNumeric: 'tabular-nums', transform: `scale(${live ? 1 + 0.3 * (1 - k01(f, T5, 20)) : 1})`}}>{pct >= 0 ? '+' : ''}{pct.toFixed(1)}%</div>
        <svg width={CW} height={CHh} style={{position: 'absolute', left: 0, top: 0}}>
          <Defs />
          <line x1={L} x2={R} y1={gy(pc)} y2={gy(pc)} stroke="rgba(255,255,255,0.3)" strokeDasharray="6 5" />
          <line x1={gx(NEWS)} x2={gx(NEWS)} y1={T - 10} y2={Bt} stroke={GOLD} strokeWidth={2} strokeDasharray="5 5" />
          {live && <path d={d + ` L${gx(last[0]).toFixed(1)},${Bt} L${L},${Bt} Z`} fill="url(#cu)" />}
          {live && <path d={d} fill="none" stroke={UP} strokeWidth={10} filter="url(#bl6)" opacity={0.8} />}
          <path d={d} fill="none" stroke={live ? '#ffd9d2' : '#cfd6dd'} strokeWidth={live ? 3.5 : 3} strokeLinejoin="round" />
          <circle cx={gx(last[0])} cy={gy(last[1])} r={live ? 9 + 3 * Math.sin(f / 4) : 6} fill={live ? '#fff' : '#cfd6dd'} />
          {live && <Firework f={f} at={T5} x={gx(last[0])} y={gy(last[1])} c={i % 2 ? GOLD : UP} n={28} big={0.5} />}
          <text x={R} y={Bt + 24} textAnchor="end" fontSize={17} fill="rgba(255,255,255,0.45)">{isIdx ? '9:30 开盘前不交易' : '4:00 → 12:00'}</text>
        </svg>
      </div>;
    })}
    <div style={{position: 'absolute', left: 70, top: 1340, fontFamily: 'NSans', fontSize: 18, color: 'rgba(255,255,255,0.45)'}}>Yahoo Finance 1 分钟分时 · 金线 = 8:55 消息 · 指数开盘前按上周五收盘画平</div>
  </AbsoluteFill>;
};

// ---------- 段 F：数据牌一摞（L12） ----------
const CARDS: [number, string, string, string][] = [
  [TEND, '开盘', '+33.1%', '167.04 美元'],
  [mt(135.88), '美东中午 12 点', `+${(((D.nvda_px as number) / PREV - 1) * 100).toFixed(1)}%`, `${(D.nvda_px as number).toFixed(2)} 美元`],
  [mt(137.32), '一开盘市值加回', '≈1 万亿', '美元'],
  [mt(138.76), '纳斯达克 当天中午', `+${(((D.ixic_px as number) / (D.ixic_prev as number) - 1) * 100).toFixed(1)}%`, '三大指数一起涨'],
];
const Stack: React.FC<{f: number}> = ({f}) => {
  if (f < TEND) return null;
  return <AbsoluteFill style={{background: BG, opacity: k01(f, TEND, 6)}}>
    <div style={{position: 'absolute', left: 70, width: 820, top: 230, textAlign: 'center', fontFamily: 'NSans'}}>
      <div style={{fontSize: 40, color: '#aaa', fontWeight: 700}}>2026年11月23日</div>
      <div style={{fontFamily: 'NSerif', fontWeight: 900, fontSize: 110, color: '#fff'}}>黄仁勋回来了</div>
    </div>
    {CARDS.map(([at, t, big, sub], i) => {
      if (f < at) return null;
      const later = CARDS.filter((cd) => f >= cd[0]).length - 1 - i;
      const k = outq(k01(f, at, 14));
      const y = 440 + i * 215 + 100 * (1 - k);
      return <div key={i} style={{position: 'absolute', left: 80, width: 810, top: y, height: 200, borderRadius: 22, background: 'rgba(30,8,8,0.92)', border: `3px solid ${i === CARDS.length - 1 ? GOLD : UP}`, boxShadow: `0 0 40px rgba(255,59,59,0.35)`, opacity: k * (1 - 0.35 * Math.min(1, later)), transform: `scale(${1.15 - 0.15 * k - 0.04 * Math.min(1, later)})`, fontFamily: 'NSans', padding: '16px 36px', boxSizing: 'border-box'}}>
        <div style={{fontSize: 34, color: '#ddd', fontWeight: 700}}>{t}</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 24}}>
          <span style={{fontSize: 108, lineHeight: 1.1, fontWeight: 700, color: i === CARDS.length - 1 ? GOLD : UP, textShadow: sh}}>{big}</span>
          <span style={{fontSize: 44, color: '#fff', fontWeight: 700}}>{sub}</span>
        </div>
      </div>;
    })}
    <div style={{position: 'absolute', left: 70, width: 820, top: 1300, textAlign: 'center', fontFamily: 'NSans', fontSize: 22, color: '#888'}}>数据：Yahoo Finance · 逐笔为示意 · 本视频不构成任何投资建议 · 金融博物馆</div>
  </AbsoluteFill>;
};

// ---------- 主合成 ----------
const HITS: [number, number, number][] = [[TPEAK, 40, 26], [EVENTS[1].at, 45, 24], [T1, 80, 34], [T2, 100, 40], [TOPEN, 70, 30], [T5, 120, 44], [TEND, 50, 26]];
const shake = (f: number) => {
  const dec = (at: number, amp: number, dur: number) => (f >= at ? Math.max(0, 1 - (f - at) / dur) * amp : 0);
  let amp = (f >= T2 && f < TG ? 5 : 0) + (f >= T5 && f < TEND ? 6 : 0);
  let punch = 0, rgb = 0;
  for (const [at, a, d] of HITS) { amp += dec(at, a, d); const q = dec(at, 1, 18); punch += 0.1 * q * q; rgb += dec(at, 16, 14); }
  for (const at of ONSETS) { amp += dec(at, 18, 12); punch += 0.025 * dec(at, 1, 10); }
  for (const at of LANDS) { amp += dec(at, 7, 8); punch += 0.008 * dec(at, 1, 8); }
  return {sx: (random(`sx${f}`) - 0.5) * amp, sy: (random(`sy${f}`) - 0.5) * amp, sr: (random(`sr${f}`) - 0.5) * amp * 0.02, punch, rgb};
};
const duck = (fr: number) => {
  let v = 1;
  for (const at of [T5]) if (fr >= at - 24 && fr < at) v = Math.min(v, 1 - 0.65 * k01(fr, at - 24, 20));
  return v;
};
const SFX: [number, string, number][] = [
  ...LANDS.slice(1, -1).map((t) => [t - 1, 'tap', 0.35] as [number, string, number]),
  ...LEVELS.map((l) => [l.fr - 1, 'thud', 0.7] as [number, string, number]),
  [TPEAK - 1, 'hit', 0.9], [EVENTS[1].at - 1, 'shatter', 0.7], [EVENTS[0].at - 1, 'hit', 0.6], [T1 - 1, 'boom', 0.9], [T1 - 1, 'shatter', 0.9],
  [T2 - 30, 'swoosh', 0.9], [T2 - 1, 'boom', 1], [T2 - 1, 'hit', 1], [TOPEN - 1, 'timpani', 0.9],
  [T5 - 26, 'swoosh', 0.9], [T5 - 1, 'boom', 1], [T5 - 1, 'timpani', 1],
  ...CARDS.map(([at]) => [at - 1, 'hit', 0.8] as [number, string, number]),
];
export const MV4: React.FC = () => {
  loadFonts();
  const f = useCurrentFrame();
  const {sx, sy, sr, punch, rgb} = shake(f);
  const intro = f < TPEAK + 10;
  return <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px) rotate(${sr}deg) scale(${1 + punch})`, filter: rgb > 0.5 ? `drop-shadow(${rgb}px 0 0 rgba(255,0,60,0.55)) drop-shadow(${-rgb}px 0 0 rgba(0,220,255,0.5))` : undefined}}>
      <Stars f={f} />
      <Daily f={f} />
      <Intraday f={f} />
      <HUD f={f} />
      {intro && <div style={{position: 'absolute', left: 0, right: 0, top: 720, padding: '36px 0', background: 'linear-gradient(180deg, rgba(3,4,7,0) 0%, rgba(3,4,7,0.82) 22%, rgba(3,4,7,0.82) 78%, rgba(3,4,7,0) 100%)', textAlign: 'center', fontFamily: 'NSerif', fontWeight: 900, color: '#fff', textShadow: sh, opacity: k01(f, 0, 14) * (1 - k01(f, TPEAK - 12, 14)), transform: `scale(${1.08 - 0.08 * outq(k01(f, 0, 40))})`}}>
        <div style={{fontSize: 70, color: '#cfd6dd'}}>一个视频</div>
        <div style={{fontSize: 80}}>用可视化数据带你看懂</div>
        <div style={{fontSize: 86, color: GOLD}}>英伟达这次的跌宕起伏</div>
      </div>}
      <Grid9 f={f} />
      <Stack f={f} />
      <Flash f={f} at={TPEAK} c={GOLD} d={14} o={0.35} />
      <Flash f={f} at={T1} c="#ffffff" d={20} o={0.7} />
      <Flash f={f} at={T2} c="#ffffff" d={16} />
      <Flash f={f} at={TOPEN} c={UP} d={20} o={0.45} />
      <Flash f={f} at={T5} c="#ffffff" d={20} />
      <Flash f={f} at={TEND} c={UP} d={18} o={0.4} />
    </AbsoluteFill>
    <Push f={f} />
    {SFX.map(([at, n, v], i) => <Sequence key={i} from={Math.max(0, at)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
    <Audio src={staticFile('mv/fever.mp3')} startFrom={Math.round(MS * 60)} volume={(fr) => Math.min(1, fr / 20) * duck(fr)} />
  </AbsoluteFill>;
};

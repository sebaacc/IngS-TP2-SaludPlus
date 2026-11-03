# Soft instrumental bed (warm pad + gentle plucks), synthesised locally, 300 s.
# Pure standard library; writes assets/music/bed-raw.wav (reverb/fades applied by ffmpeg).
import math, wave, struct, array, os, sys

SR = 24000
DUR = 300.0
BPM = 76
beat = 60 / BPM
bar = beat * 4
N = int(SR * DUR)
out = array.array("f", [0.0]) * N

def hz(m): return 440 * 2 ** ((m - 69) / 12)
# Cmaj9, Am7, Fmaj7, G6sus — two bars each
chords = [[48, 55, 64, 67, 74], [45, 52, 60, 67, 72], [41, 53, 57, 64, 69], [43, 55, 62, 64, 71]]
chord_len = bar * 2

def add_note(t0, length, freq, amp, attack, partials):
    i0 = int(t0 * SR); n = int(length * SR)
    rel = min(1.2, length * 0.4)
    for k in range(n):
        i = i0 + k
        if i >= N: break
        t = k / SR
        env = min(1.0, t / attack) * (1.0 if t < length - rel else max(0.0, (length - t) / rel))
        s = 0.0
        for mult, a in partials:
            s += a * math.sin(2 * math.pi * freq * mult * t)
        out[i] += s * env * amp

t = 0.0; ci = 0
while t < DUR:
    ch = chords[ci % 4]
    for j, m in enumerate(ch):
        add_note(t, chord_len + 1.0, hz(m), 0.045 if j else 0.06, 1.8, [(1, 1), (2, 0.18), (1.003, 0.5)])
    # plucked arpeggio on eighth notes, sparse
    pattern = [0, 2, 3, 4, 3, 2, 1, 2]
    for s in range(16):
        if s % 4 == 3: continue
        m = ch[pattern[s % 8] % len(ch)] + 12
        add_note(t + s * beat / 2, 0.9, hz(m), 0.03, 0.005, [(1, 1), (2, 0.25), (3, 0.08)])
    t += chord_len; ci += 1
    sys.stderr.write(f"\r{t:.0f}s"); sys.stderr.flush()

peak = max(abs(x) for x in out) or 1
os.makedirs(sys.argv[1], exist_ok=True)
with wave.open(os.path.join(sys.argv[1], "bed-raw.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(struct.pack(f"<{N}h", *(int(x / peak * 0.8 * 32767) for x in out)))

/**
 * DSA Visualizer - Web Audio API Synthesizer (js/audio.js)
 * Bộ tổng hợp âm thanh thuật toán thời gian thực sống động, uy lực & rõ ràng (Zero Dependencies):
 * - Tần số tỷ lệ thuận theo giá trị phần tử (số nhỏ âm trầm ấm, số lớn âm bổng ngân vang).
 * - Dynamics Compressor chống vỡ tiếng (anti-clipping), tăng cường độ dày và độ nảy.
 * - Hiệu ứng âm thanh đa âm sắc: gõ phím marimba/xylophone, lướt hoán đổi whoosh-snap,
 *   chuông hợp âm đúng, còi báo sai chuẩn game, chuông tiên gợi ý và khúc ca chiến thắng arpeggio.
 */

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('dsa_audio_muted') === 'true';
    this.gainMaster = null;
    this.compressor = null;
    this.masterVolume = 0.38; // Âm lượng rõ nét, sống động, to rõ
  }

  /**
   * Khởi tạo AudioContext sau tương tác đầu tiên của người dùng
   */
  ensureContext() {
    if (this.isMuted) return false;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();

      // 1. Master Gain
      this.gainMaster = this.ctx.createGain();
      this.gainMaster.gain.value = this.isMuted ? 0 : this.masterVolume;

      // 2. Dynamics Compressor giúp âm thanh to, dày, sống động và tuyệt đối không méo tiếng khi nhiều nốt cùng phát
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(14, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.gainMaster.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  /**
   * Chuyển đổi giá trị phần tử thành tần số âm nhạc tương ứng (Hz)
   * Sử dụng dải tần số âm nhạc từ 220Hz (A3) đến 988Hz (B5)
   */
  getFrequency(val, min = 5, max = 100) {
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    const range = safeMax - safeMin || 1;
    const ratio = Math.max(0, Math.min(1, (val - safeMin) / range));
    // Dải tần số âm nhạc êm dịu, trong trẻo và dễ nhận diện cao độ
    return 220 + ratio * 720;
  }

  /**
   * Phát nốt đơn dạng gõ thanh gỗ / chuông kim loại (Marimba / Kalimba Timbre)
   * Kết hợp âm cơ bản (Triangle) và bồi âm gõ (Sine click) tạo độ nảy sống động
   */
  playTone(val, min = 5, max = 100, duration = 0.12) {
    if (!this.ensureContext()) return;
    try {
      const freq = this.getFrequency(val, min, max);
      const now = this.ctx.currentTime;

      // 1. Dao động chính (Triangle wave: ấm và dày)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.48, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.gainMaster);
      osc.start(now);
      osc.stop(now + duration + 0.02);

      // 2. Bồi âm gõ đanh (High mallet ping / click)
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(freq * 2.5, now);

      clickGain.gain.setValueAtTime(0.001, now);
      clickGain.gain.linearRampToValueAtTime(0.22, now + 0.003);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      clickOsc.connect(clickGain);
      clickGain.connect(this.gainMaster);
      clickOsc.start(now);
      clickOsc.stop(now + 0.045);
    } catch {}
  }

  /**
   * Âm thanh So sánh: 2 nốt gõ nảy liên tiếp với cao độ chuẩn xác
   */
  playCompare(val1, val2, min = 5, max = 100) {
    if (!this.ensureContext()) return;
    this.playTone(val1, min, max, 0.09);
    setTimeout(() => {
      this.playTone(val2, min, max, 0.09);
    }, 65);
  }

  /**
   * Âm thanh Hoán đổi: Lướt tần số uy lực kết hợp âm trượt Whoosh-Snap
   */
  playSwap(val1, val2, min = 5, max = 100) {
    if (!this.ensureContext()) return;
    try {
      const freq1 = this.getFrequency(val1, min, max);
      const freq2 = this.getFrequency(val2, min, max);
      const now = this.ctx.currentTime;
      const duration = 0.16;

      // 1. Âm trượt cao độ (Pitch Glissando)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq1, now);
      osc.frequency.exponentialRampToValueAtTime(freq2, now + duration);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.55, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.gainMaster);
      osc.start(now);
      osc.stop(now + duration + 0.02);

      // 2. Tiếng snap tiếp đất ở điểm đích
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      const snapTime = now + duration * 0.7;

      snapOsc.type = 'sine';
      snapOsc.frequency.setValueAtTime(freq2 * 1.5, snapTime);
      snapGain.gain.setValueAtTime(0.001, snapTime);
      snapGain.gain.linearRampToValueAtTime(0.3, snapTime + 0.005);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, snapTime + 0.05);

      snapOsc.connect(snapGain);
      snapGain.connect(this.gainMaster);
      snapOsc.start(snapTime);
      snapOsc.stop(snapTime + 0.06);
    } catch {}
  }

  /**
   * Âm thanh khi người dùng làm ĐÚNG: Hợp âm ngân vang tươi vui (Major Triad Sparkle: Đô - Mi - Sol - Đô)
   */
  playCorrect() {
    if (!this.ensureContext()) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.055;
        const dur = 0.32;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.42, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.gainMaster);
        osc.start(startTime);
        osc.stop(startTime + dur + 0.02);
      });
    } catch {}
  }

  /**
   * Âm thanh khi người dùng làm SAI: Âm còi cảnh báo 2 nhịp "Uh-Oh" phong cách game
   */
  playWrong() {
    if (!this.ensureContext()) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [
        { freq: 220, start: now, dur: 0.12 },
        { freq: 145, start: now + 0.12, dur: 0.22 }
      ];

      notes.forEach(({ freq, start, dur }) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);

        // Lọc bớt tần số chói gắt, giữ tiếng đầm và dứt khoát
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.45, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainMaster);

        osc.start(start);
        osc.stop(start + dur + 0.02);
      });
    } catch {}
  }

  /**
   * Âm thanh Gợi ý (Hint): Chuông tiên tinh khôi lướt nhanh (Ascending Celestial Chime)
   */
  playHint() {
    if (!this.ensureContext()) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.05;
        const dur = 0.35;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.38, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.gainMaster);
        osc.start(startTime);
        osc.stop(startTime + dur + 0.02);
      });
    } catch {}
  }

  /**
   * Khúc ca Chiến Thắng (Victory Fanfare): Quét toàn bộ mảng và bung hợp âm vinh quang
   */
  playVictory(array = []) {
    if (!this.ensureContext() || !array || array.length === 0) return;
    try {
      const values = array.map(x => x.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const now = this.ctx.currentTime;
      const stepInterval = Math.max(0.035, Math.min(0.07, 0.9 / array.length));

      // 1. Quét Arpeggio thăng hoa qua từng phần tử
      values.forEach((val, idx) => {
        const freq = this.getFrequency(val, min, max);
        const startTime = now + idx * stepInterval;
        const dur = 0.28;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.gainMaster);
        osc.start(startTime);
        osc.stop(startTime + dur + 0.02);
      });

      // 2. Hợp âm Đại thắng cuối cùng (Grand Chord Fanfare)
      const chordTime = now + array.length * stepInterval + 0.06;
      const finaleNotes = [523.25, 659.25, 783.99, 1046.5]; // C Major
      finaleNotes.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const dur = 0.85;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, chordTime);

        gain.gain.setValueAtTime(0.001, chordTime);
        gain.gain.linearRampToValueAtTime(0.42, chordTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + dur);

        osc.connect(gain);
        gain.connect(this.gainMaster);
        osc.start(chordTime);
        osc.stop(chordTime + dur + 0.05);
      });
    } catch {}
  }

  /**
   * Bật / tắt âm thanh
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('dsa_audio_muted', String(this.isMuted));
    if (this.gainMaster) {
      this.gainMaster.gain.value = this.isMuted ? 0 : this.masterVolume;
    }
    return this.isMuted;
  }
}

export const soundFX = new AudioSynthesizer();

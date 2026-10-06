/**
 * study with SNU - Compact Pomodoro Timer
 */

class CompactTimer {
  constructor() {
    this.modes = {
      focus: { label: "집중", seconds: 25 * 60 },
      shortBreak: { label: "휴식", seconds: 5 * 60 },
      longBreak: { label: "긴 휴식", seconds: 15 * 60 }
    };

    this.currentMode = "focus";
    this.totalSeconds = this.modes.focus.seconds;
    this.remainingSeconds = this.totalSeconds;
    this.intervalId = null;
    this.isRunning = false;

    this.loadStats();
  }

  loadStats() {
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem("snu_compact_stats");
    let stats = { date: today, count: 0 };
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.date === today) stats = p;
      } catch (e) {}
    }
    this.stats = stats;
  }

  saveStats() {
    localStorage.setItem("snu_compact_stats", JSON.stringify(this.stats));
    this.updateStatsDisplay();
  }

  initUI() {
    this.timeDisplay = document.getElementById("mini-time-text");
    this.startBtn = document.getElementById("mini-start-btn");
    this.resetBtn = document.getElementById("mini-reset-btn");
    this.modeButtons = document.querySelectorAll(".mini-mode-btn");

    this.modeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        if (mode && this.modes[mode]) this.switchMode(mode);
      });
    });

    if (this.startBtn) {
      this.startBtn.addEventListener("click", () => this.toggle());
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.reset());
    }

    this.render();
    this.updateStatsDisplay();
  }

  switchMode(mode) {
    if (this.isRunning) this.pause();
    this.currentMode = mode;
    this.totalSeconds = this.modes[mode].seconds;
    this.remainingSeconds = this.totalSeconds;

    this.modeButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    this.render();
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    if (window.spotAudio) window.spotAudio.unlock();

    this.isRunning = true;
    if (this.startBtn) {
      this.startBtn.classList.add("running");
      this.startBtn.textContent = "일시정지";
    }

    this.intervalId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.render();
      } else {
        this.complete();
      }
    }, 1000);
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.intervalId = null;

    if (this.startBtn) {
      this.startBtn.classList.remove("running");
      this.startBtn.textContent = "시작";
    }
  }

  reset() {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.render();
  }

  complete() {
    this.pause();
    if (window.spotAudio) window.spotAudio.playChime();

    if (this.currentMode === "focus") {
      this.stats.count++;
      this.saveStats();
      if (window.showToast) window.showToast("🍅 뽀모도로 완료! 5분간 쉬어가요.", "success");
      this.switchMode("shortBreak");
    } else {
      if (window.showToast) window.showToast("☕ 휴식 끝! 다시 시작해볼까요?", "success");
      this.switchMode("focus");
    }
  }

  render() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (this.timeDisplay) {
      this.timeDisplay.textContent = timeStr;
    }

    document.title = `(${timeStr}) study with SNU`;
  }

  updateStatsDisplay() {
    const el = document.getElementById("daily-pomo-badge");
    if (el) el.textContent = `${this.stats.count}개 완료`;
  }
}

window.compactTimer = new CompactTimer();

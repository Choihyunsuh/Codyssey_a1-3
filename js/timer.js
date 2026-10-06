/**
 * Pomodoro Interval Timer
 * 25분 집중 / 5분 휴식 / 15분 긴 휴식
 */

class PomodoroTimer {
  constructor() {
    this.modes = {
      focus: { label: "집중 시간", seconds: 25 * 60, color: "var(--snu-gold)" },
      shortBreak: { label: "짧은 휴식", seconds: 5 * 60, color: "var(--accent-mint)" },
      longBreak: { label: "긴 휴식", seconds: 15 * 60, color: "#38bdf8" }
    };
    
    this.currentMode = "focus";
    this.totalSeconds = this.modes.focus.seconds;
    this.remainingSeconds = this.totalSeconds;
    this.intervalId = null;
    this.isRunning = false;

    // SVG 프로그레스 원형 둘레 (2 * PI * 110 = 691.15)
    this.circleCircumference = 691.15;

    // 통계 (LocalStorage)
    this.loadStats();
  }

  loadStats() {
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem("snu_pomo_stats");
    let stats = { date: today, count: 0, focusMinutes: 0 };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          stats = parsed;
        }
      } catch (e) {}
    }
    this.stats = stats;
  }

  saveStats() {
    localStorage.setItem("snu_pomo_stats", JSON.stringify(this.stats));
    this.updateStatsDisplay();
  }

  initUI() {
    this.timeDisplay = document.getElementById("timer-time");
    this.statusBadge = document.getElementById("timer-status-badge");
    this.progressRing = document.getElementById("timer-ring-progress");
    this.startBtn = document.getElementById("timer-start-btn");
    this.resetBtn = document.getElementById("timer-reset-btn");
    this.modeButtons = document.querySelectorAll(".mode-btn");

    // 모드 전환 버튼 바인딩
    this.modeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        if (mode && this.modes[mode]) {
          this.switchMode(mode);
        }
      });
    });

    // 시작/일시정지 버튼
    if (this.startBtn) {
      this.startBtn.addEventListener("click", () => this.toggle());
    }

    // 리셋 버튼
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.reset());
    }

    this.render();
    this.updateStatsDisplay();
  }

  switchMode(mode) {
    if (this.isRunning) {
      this.pause();
    }
    this.currentMode = mode;
    this.totalSeconds = this.modes[mode].seconds;
    this.remainingSeconds = this.totalSeconds;

    // 탭 UI 활성화 갱신
    this.modeButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    if (this.progressRing) {
      this.progressRing.classList.toggle("rest", mode !== "focus");
    }

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
    
    // 오디오 컨텍스트 언락
    if (window.ambientAudio) {
      window.ambientAudio.unlock();
    }

    this.isRunning = true;
    if (this.startBtn) {
      this.startBtn.classList.add("running");
      this.startBtn.innerHTML = '<span>⏸ 일시정지</span>';
    }

    this.intervalId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.render();
      } else {
        this.completeSession();
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
      this.startBtn.innerHTML = '<span>▶ 시작하기</span>';
    }
  }

  reset() {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.render();
  }

  completeSession() {
    this.pause();
    
    // 알림 차임벨
    if (window.ambientAudio) {
      window.ambientAudio.playChime();
    }

    if (this.currentMode === "focus") {
      this.stats.count++;
      this.stats.focusMinutes += 25;
      this.saveStats();
      
      if (window.showToast) {
        window.showToast("🍅 뽀모도로 달성! 5분간 머리를 식히며 휴식하세요.", "success");
      }
      this.switchMode("shortBreak");
    } else {
      if (window.showToast) {
        window.showToast("☕ 휴식이 끝났습니다! 다시 몰입해 볼까요?", "success");
      }
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

    if (this.statusBadge) {
      this.statusBadge.textContent = this.modes[this.currentMode].label;
    }

    // 문서 타이틀 반영
    document.title = `(${timeStr}) SNU Study Cafe`;

    // SVG 프로그레스 원형 갱신
    if (this.progressRing) {
      const progressFraction = 1 - (this.remainingSeconds / this.totalSeconds);
      const offset = this.circleCircumference * (1 - progressFraction);
      this.progressRing.style.strokeDashoffset = offset;
    }
  }

  updateStatsDisplay() {
    const countEl = document.getElementById("stat-pomo-count");
    const minEl = document.getElementById("stat-pomo-minutes");
    const guideCountEl = document.getElementById("guide-stat-count");

    if (countEl) countEl.textContent = `${this.stats.count}회`;
    if (minEl) minEl.textContent = `${this.stats.focusMinutes}분`;
    if (guideCountEl) guideCountEl.textContent = `${this.stats.count}개 완료`;
  }
}

window.pomodoroTimer = new PomodoroTimer();

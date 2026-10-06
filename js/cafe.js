/**
 * study with SNU - Cafe Kiosk & Receipt Controller
 */

class CafeController {
  constructor() {
    this.selectedCondition = "🥱 피곤";
    this.selectedMood = "집중";
    this.selectedDrink = "리딸라";
    this.currentReceipt = null;

    this.drinkIcons = {
      "리딸라": "🍓",
      "말차라떼": "🍵",
      "아메리카노": "☕",
      "카페라떼": "🥛",
      "자몽허니티": "🍯"
    };
  }

  initUI() {
    this.nameInput = document.getElementById("kiosk-name-input");
    this.subjectInput = document.getElementById("kiosk-subject-input");
    this.goalInput = document.getElementById("kiosk-goal-input");
    this.orderBtn = document.getElementById("kiosk-order-btn");
    this.loadingBox = document.getElementById("kiosk-loading");
    this.receiptCard = document.getElementById("kiosk-receipt");
    this.receiptPlaceholder = document.getElementById("receipt-placeholder");

    // 1. 컨디션 이모지 버튼 바인딩
    const emojiBtns = document.querySelectorAll(".emoji-btn");
    emojiBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        emojiBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.selectedCondition = btn.dataset.condition;
      });
    });

    // 2. 무드 단어 칩 바인딩
    const moodBtns = document.querySelectorAll(".mood-chip-btn");
    moodBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        moodBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.selectedMood = btn.dataset.mood;
      });
    });

    // 3. 음료 칩 바인딩
    const drinkChips = document.querySelectorAll(".drink-chip");
    drinkChips.forEach(chip => {
      chip.addEventListener("click", () => {
        drinkChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.selectedDrink = chip.dataset.drink;
      });
    });

    // 4. 주문하기 버튼
    if (this.orderBtn) {
      this.orderBtn.addEventListener("click", () => this.handleOrder());
    }

    // 5. 영수증 액션 버튼
    const deliverBtn = document.getElementById("receipt-deliver-btn");
    if (deliverBtn) {
      deliverBtn.addEventListener("click", () => this.deliverToDesk());
    }

    const copyBtn = document.getElementById("receipt-copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => this.copyReceipt());
    }
  }

  async handleOrder() {
    const name = this.nameInput ? this.nameInput.value.trim() : "";
    const subject = this.subjectInput ? this.subjectInput.value.trim() : "";
    const goal = this.goalInput ? this.goalInput.value.trim() : "";

    // 유효성 검사 (과목 또는 목표 누락 시)
    if (!subject) {
      if (window.showToast) window.showToast("⚠️ 공부할 과목을 적어주세요!", "warning");
      if (this.subjectInput) this.subjectInput.focus();
      return;
    }

    this.setLoading(true);

    const payload = {
      name: name || "학우",
      subject: subject,
      goal: goal || "오늘 분량 끝내기",
      condition: this.selectedCondition,
      mood: this.selectedMood,
      drinkPreference: this.selectedDrink
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      this.renderReceipt(data, payload);
      if (window.showToast) window.showToast("🧾 주문서가 나왔어요!", "success");
    } catch (err) {
      // 스마트 Fallback
      const fallback = {
        orderNumber: "SNU-" + Math.floor(1000 + Math.random() * 9000),
        recommendedDrink: payload.drinkPreference,
        motivationMessage: `${payload.name}님, ${payload.subject} 몰입 준비 완료! 이번 25분 차분하게 달려봐요.`
      };
      this.renderReceipt(fallback, payload);
      if (window.showToast) window.showToast("☕ 따뜻한 맞춤 주문서가 준비되었어요.", "success");
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    if (this.orderBtn) this.orderBtn.disabled = isLoading;
    if (this.loadingBox) this.loadingBox.style.display = isLoading ? "flex" : "none";
    if (isLoading) {
      if (this.receiptPlaceholder) this.receiptPlaceholder.style.display = "none";
      if (this.receiptCard) this.receiptCard.style.display = "none";
    }
  }

  renderReceipt(data, payload) {
    this.currentReceipt = { ...data, ...payload };

    const drink = data.recommendedDrink || payload.drinkPreference;
    const icon = this.drinkIcons[drink] || "☕";

    const nameEl = document.getElementById("rc-name");
    const subjEl = document.getElementById("rc-subject");
    const goalEl = document.getElementById("rc-goal");
    const moodEl = document.getElementById("rc-mood");
    const drinkEl = document.getElementById("rc-drink");
    const quoteEl = document.getElementById("rc-quote");
    const dateEl = document.getElementById("rc-date");

    if (nameEl) nameEl.textContent = payload.name;
    if (subjEl) subjEl.textContent = payload.subject;
    if (goalEl) goalEl.textContent = payload.goal;
    if (moodEl) moodEl.textContent = `${payload.condition} · ${payload.mood}`;
    if (drinkEl) drinkEl.textContent = `${icon} ${drink}`;
    if (quoteEl) quoteEl.textContent = `"${data.motivationMessage}"`;

    if (dateEl) {
      const now = new Date();
      dateEl.textContent = `${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    }

    if (this.receiptPlaceholder) this.receiptPlaceholder.style.display = "none";
    if (this.receiptCard) this.receiptCard.style.display = "block";
  }

  // 가운데 하단 커피 오브젝트로 배달
  deliverToDesk() {
    if (!this.currentReceipt) return;

    const icon = this.drinkIcons[this.currentReceipt.recommendedDrink] || "☕";
    const mugIconEl = document.getElementById("desk-coffee-icon");
    const mugLabelEl = document.getElementById("desk-coffee-label");
    const bubbleEl = document.getElementById("desk-coffee-bubble");
    const steamEl = document.getElementById("desk-coffee-steam");

    if (mugIconEl) mugIconEl.textContent = icon;
    if (mugLabelEl) mugLabelEl.textContent = this.currentReceipt.recommendedDrink;
    if (bubbleEl) bubbleEl.textContent = `"${this.currentReceipt.motivationMessage}"`;
    if (steamEl) steamEl.style.display = "block";

    if (window.showToast) window.showToast("🍹 책상 가운데로 음료를 놓았어요!", "success");
    if (window.switchSection) window.switchSection("desk");
  }

  copyReceipt() {
    if (!this.currentReceipt) return;
    const text = `[🏛️ study with SNU 영수증]
• 이름: ${this.currentReceipt.name}
• 과목: ${this.currentReceipt.subject} (${this.currentReceipt.goal})
• 음료: ${this.currentReceipt.recommendedDrink}
• 응원: "${this.currentReceipt.motivationMessage}"`;

    navigator.clipboard.writeText(text).then(() => {
      if (window.showToast) window.showToast("📋 영수증이 복사되었어요!", "success");
    });
  }
}

window.cafeController = new CafeController();

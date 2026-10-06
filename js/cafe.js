/**
 * Neutinamu Cafe AI Ordering & Receipt Renderer
 * Gemini AI API 연동 및 디지털 감성 영수증 발행
 */

class NeutinamuCafe {
  constructor() {
    this.selectedDrink = "리딸라 (리얼딸기라떼)";
    this.selectedCondition = "피곤하고 당 충전 필요";
    this.currentReceiptData = null;

    // 느티나무 인기 음료 카탈로그 (Fallback 및 프리셋용)
    this.drinkCatalog = {
      "리딸라 (리얼딸기라떼)": {
        icon: "🍓",
        tagline: "서울대 느티나무의 영원한 1티어, 묵직한 생딸기와 우유의 당 충전 조합",
        color: "#f43f5e"
      },
      "말차라떼": {
        icon: "🍵",
        tagline: "진한 말차 특유의 쌉싸름함으로 잡념을 가라앉히는 차분한 집중템",
        color: "#10b981"
      },
      "아이스 아메리카노": {
        icon: "☕",
        tagline: "관정 열람실 밤샘러들의 생명수, 군더더기 없는 깔끔한 다크 로스팅",
        color: "#78350f"
      },
      "카페라떼": {
        icon: "🥛",
        tagline: "부드러운 에스프레소와 고소한 스팀밀크로 지속적인 에너지를 주는 메뉴",
        color: "#b45309"
      },
      "자몽허니블랙티": {
        icon: "🍯",
        tagline: "달콤 쌉싸름한 자몽과 홍차 향으로 나른한 오후를 깨우는 산뜻한 음료",
        color: "#ea580c"
      }
    };
  }

  initUI() {
    this.taskInput = document.getElementById("cafe-task-input");
    this.orderBtn = document.getElementById("cafe-order-btn");
    this.loadingBox = document.getElementById("kiosk-loading");
    this.receiptCard = document.getElementById("kiosk-receipt");
    this.receiptPlaceholder = document.getElementById("receipt-empty-placeholder");
    
    // 음료 칩 선택 이벤트
    const drinkChips = document.querySelectorAll(".drink-chip");
    drinkChips.forEach(chip => {
      chip.addEventListener("click", () => {
        drinkChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.selectedDrink = chip.dataset.drink;
      });
    });

    // 컨디션 태그 선택 이벤트
    const conditionTags = document.querySelectorAll(".condition-tag");
    conditionTags.forEach(tag => {
      tag.addEventListener("click", () => {
        conditionTags.forEach(t => t.classList.remove("active"));
        tag.classList.add("active");
        this.selectedCondition = tag.dataset.condition;
      });
    });

    // 주문 버튼 클릭
    if (this.orderBtn) {
      this.orderBtn.addEventListener("click", () => this.handleOrder());
    }

    // 영수증 액션 버튼들
    const deliverBtn = document.getElementById("receipt-deliver-btn");
    if (deliverBtn) {
      deliverBtn.addEventListener("click", () => this.deliverDrinkToDesk());
    }

    const copyBtn = document.getElementById("receipt-copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => this.copyReceiptText());
    }
  }

  async handleOrder() {
    const task = this.taskInput ? this.taskInput.value.trim() : "";

    // 1. 과제 요구사항: 필수값 누락 (빈 입력) 예외 처리
    if (!task) {
      if (window.showToast) {
        window.showToast("⚠️ 바리스타에게 오늘 어떤 공부를 할지 알려주세요!", "warning");
      }
      if (this.taskInput) {
        this.taskInput.focus();
        this.taskInput.style.borderColor = "#ef4444";
        setTimeout(() => {
          this.taskInput.style.borderColor = "";
        }, 1500);
      }
      return;
    }

    // 2. 과제 요구사항: 로딩 및 대기 상태 UI 표시
    this.setLoading(true);

    const payload = {
      task: task,
      condition: this.selectedCondition,
      drinkPreference: this.selectedDrink
    };

    try {
      // 8초 타임아웃 컨트롤러
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API 응답 오류 (${response.status})`);
      }

      const data = await response.json();
      this.renderReceipt(data, task);
      if (window.showToast) {
        window.showToast("🧾 느티나무 바리스타의 맞춤 주문서가 나왔습니다!", "success");
      }
    } catch (err) {
      console.warn("AI API 응답 지연 또는 로컬 환경 fallback 작동:", err.message);
      
      // 3. 과제 요구사항: API 오류 및 타임아웃 실패 처리
      if (window.showToast) {
        if (err.name === 'AbortError') {
          window.showToast("⏱️ 네트워크가 혼잡하여 바리스타의 추천 레시피로 준비했습니다.", "warning");
        } else {
          window.showToast("☕ 바리스타가 직접 블렌딩한 추천 음료로 준비해 드립니다.", "warning");
        }
      }

      // 스마트 Fallback 데이터 생성 (흐름 중단 방지)
      const fallbackData = this.generateFallbackResponse(payload);
      this.renderReceipt(fallbackData, task);
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    if (this.orderBtn) {
      this.orderBtn.disabled = isLoading;
    }
    if (this.loadingBox) {
      this.loadingBox.style.display = isLoading ? "flex" : "none";
    }
    if (isLoading) {
      if (this.receiptPlaceholder) this.receiptPlaceholder.style.display = "none";
      if (this.receiptCard) this.receiptCard.style.display = "none";
    }
  }

  generateFallbackResponse(payload) {
    const drinkInfo = this.drinkCatalog[payload.drinkPreference] || this.drinkCatalog["아이스 아메리카노"];
    return {
      recommendedDrink: payload.drinkPreference,
      drinkTagline: drinkInfo.tagline,
      motivationMessage: `"${payload.task}"을(를) 향한 첫 걸음입니다. 작은 몰입이 쌓여 커다란 성취가 됩니다. 조급해하지 말고 이번 25분에만 집중해 보세요.`,
      studyTip: "첫 5분만 참고 집중하면 뇌의 작업흥분 상태가 켜져 몰입하기 쉬워집니다.",
      orderNumber: "SNU-" + Math.floor(1000 + Math.random() * 9000)
    };
  }

  renderReceipt(data, task) {
    this.currentReceiptData = { ...data, task };

    const drink = data.recommendedDrink || this.selectedDrink;
    const drinkMeta = this.drinkCatalog[drink] || { icon: "☕", color: "#3b82f6" };

    const orderNumEl = document.getElementById("receipt-order-no");
    const taskEl = document.getElementById("receipt-task-text");
    const conditionEl = document.getElementById("receipt-condition-text");
    const drinkNameEl = document.getElementById("receipt-drink-name");
    const drinkTaglineEl = document.getElementById("receipt-drink-tagline");
    const motivationEl = document.getElementById("receipt-motivation-quote");
    const tipEl = document.getElementById("receipt-study-tip");
    const dateEl = document.getElementById("receipt-timestamp");

    if (orderNumEl) orderNumEl.textContent = data.orderNumber || "SNU-" + Math.floor(1000 + Math.random() * 9000);
    if (taskEl) taskEl.textContent = task;
    if (conditionEl) conditionEl.textContent = this.selectedCondition;
    if (drinkNameEl) drinkNameEl.textContent = `${drinkMeta.icon} ${drink}`;
    if (drinkTaglineEl) drinkTaglineEl.textContent = data.drinkTagline || "";
    if (motivationEl) motivationEl.textContent = `"${data.motivationMessage || "오늘의 몰입을 응원합니다."}"`;
    if (tipEl) tipEl.textContent = `💡 팁: ${data.studyTip || "25분 집중 후 5분 쉬어가기"}`;

    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString("ko-KR") + " " + now.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' });
    }

    if (this.receiptPlaceholder) this.receiptPlaceholder.style.display = "none";
    if (this.receiptCard) this.receiptCard.style.display = "block";
  }

  // 주문한 음료를 메인 데스크(섹션 1)에 배치하고 데스크 화면으로 이동
  deliverDrinkToDesk() {
    if (!this.currentReceiptData) return;

    const deskSlot = document.getElementById("desk-drink-slot");
    const emptyState = document.getElementById("desk-drink-empty");
    const activeDrink = document.getElementById("desk-drink-active");

    const drinkMeta = this.drinkCatalog[this.currentReceiptData.recommendedDrink] || { icon: "☕" };

    if (emptyState) emptyState.style.display = "none";
    if (activeDrink) {
      activeDrink.style.display = "flex";
      const iconEl = document.getElementById("desk-active-icon");
      const nameEl = document.getElementById("desk-active-name");
      const quoteEl = document.getElementById("desk-active-quote");

      if (iconEl) iconEl.textContent = drinkMeta.icon;
      if (nameEl) nameEl.textContent = this.currentReceiptData.recommendedDrink;
      if (quoteEl) quoteEl.textContent = `"${this.currentReceiptData.motivationMessage}"`;
    }

    if (window.showToast) {
      window.showToast("🍹 주문하신 음료가 스터디 데스크에 놓였습니다!", "success");
    }

    // 1번 탭(스터디 데스크)으로 자동 이동
    if (window.switchSection) {
      window.switchSection("desk");
    }
  }

  copyReceiptText() {
    if (!this.currentReceiptData) return;
    const text = `[🏛️ 서울대 느티나무 카공 영수증]
• 과목: ${this.currentReceiptData.task}
• 맞춤 음료: ${this.currentReceiptData.recommendedDrink}
• 응원 한마디: "${this.currentReceiptData.motivationMessage}"
#서울대카공 #뽀모도로 #SNUStudyCafe`;

    navigator.clipboard.writeText(text).then(() => {
      if (window.showToast) {
        window.showToast("📋 영수증 내용이 클립보드에 복사되었습니다!", "success");
      }
    });
  }
}

window.neutinamuCafe = new NeutinamuCafe();


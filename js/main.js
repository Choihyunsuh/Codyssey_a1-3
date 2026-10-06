/**
 * SNU Study Cafe - Main Controller & Navigation
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. 토스트 알림 시스템
  window.showToast = function(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  // 2. 섹션 전환 (데스크, 카페 카운터, 캠퍼스 도감)
  const navTabs = document.querySelectorAll(".nav-tab-btn");
  const mobileNavItems = document.querySelectorAll(".mobile-nav-item");
  const sections = document.querySelectorAll(".app-section");

  window.switchSection = function(sectionId) {
    sections.forEach(sec => {
      sec.classList.toggle("active", sec.id === `section-${sectionId}`);
    });

    navTabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.section === sectionId);
    });

    mobileNavItems.forEach(item => {
      item.classList.toggle("active", item.dataset.section === sectionId);
    });
  };

  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const section = tab.dataset.section;
      if (section) window.switchSection(section);
    });
  });

  mobileNavItems.forEach(item => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;
      if (section) window.switchSection(section);
    });
  });

  // 주문 바로가기 버튼 이벤트
  const shortcutBtn = document.getElementById("desk-order-shortcut-btn");
  if (shortcutBtn) {
    shortcutBtn.addEventListener("click", () => {
      window.switchSection("cafe");
    });
  }

  // 3. 스팟 선택 및 비디오 배경 제어
  const videoEl = document.getElementById("bg-video");
  const spotCards = document.querySelectorAll(".spot-card");

  function setSpot(spotId) {
    const spot = window.SNU_SPOTS.find(s => s.id === spotId);
    if (!spot || !videoEl) return;

    spotCards.forEach(card => {
      card.classList.toggle("active", card.dataset.spot === spotId);
    });

    // 비디오 페이드 전환 효과
    videoEl.style.opacity = "0.2";
    setTimeout(() => {
      videoEl.poster = spot.poster;
      videoEl.src = spot.videoUrl;
      videoEl.load();
      videoEl.play().catch(e => {
        console.log("영상 자동재생 정책 대기 (클릭 시 재생)");
      });
      videoEl.style.opacity = "1";
    }, 300);

    if (window.showToast) {
      window.showToast(`📍 [${spot.name}] 스팟으로 이동했습니다.`);
    }
  }

  spotCards.forEach(card => {
    card.addEventListener("click", () => {
      const spotId = card.dataset.spot;
      if (spotId) setSpot(spotId);
    });
  });

  // 4. 앰비언트 오디오 믹서 UI 바인딩
  const soundRows = document.querySelectorAll(".sound-row");
  soundRows.forEach(row => {
    const soundKey = row.dataset.sound;
    const toggleBtn = row.querySelector(".sound-toggle-btn");
    const slider = row.querySelector(".volume-slider");

    if (toggleBtn && soundKey) {
      toggleBtn.addEventListener("click", () => {
        const isActive = window.ambientAudio.toggleSound(soundKey);
        toggleBtn.classList.toggle("active", isActive);
        toggleBtn.textContent = isActive ? "✓" : "+";
      });
    }

    if (slider && soundKey) {
      slider.addEventListener("input", (e) => {
        const vol = parseFloat(e.target.value);
        window.ambientAudio.setVolume(soundKey, vol);
      });
    }
  });

  // 전체 화면 토글
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => {});
        fullscreenBtn.textContent = "✕";
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        fullscreenBtn.textContent = "⛶";
      }
    });
  }

  // 5. 모듈 초기화
  if (window.pomodoroTimer) {
    window.pomodoroTimer.initUI();
  }
  if (window.neutinamuCafe) {
    window.neutinamuCafe.initUI();
  }

  // 초기 스팟 세팅 (자하연)
  if (window.SNU_SPOTS && window.SNU_SPOTS.length > 0) {
    setSpot("jahayeon");
  }

  // 첫 사용자 터치/클릭 시 오디오 및 비디오 자동재생 해제 지원
  document.body.addEventListener("click", () => {
    if (window.ambientAudio) {
      window.ambientAudio.unlock();
    }
    if (videoEl && videoEl.paused) {
      videoEl.play().catch(e => {});
    }
  }, { once: true });
});


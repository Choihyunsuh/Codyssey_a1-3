/**
 * study with SNU - Main Navigation & Spot Audio Binding
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. 토스트 알림
  window.showToast = function(msg, type = "info") {
    const c = document.getElementById("toast-container");
    if (!c) return;
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateY(8px)";
      setTimeout(() => t.remove(), 250);
    }, 2800);
  };

  // 2. 섹션 탭 전환
  const navTabs = document.querySelectorAll(".nav-tab-btn");
  const mobileItems = document.querySelectorAll(".mobile-nav-item");
  const sections = document.querySelectorAll(".app-section");

  window.switchSection = function(id) {
    sections.forEach(s => s.classList.toggle("active", s.id === `section-${id}`));
    navTabs.forEach(t => t.classList.toggle("active", t.dataset.section === id));
    mobileItems.forEach(m => m.classList.toggle("active", m.dataset.section === id));
  };

  navTabs.forEach(t => t.addEventListener("click", () => window.switchSection(t.dataset.section)));
  mobileItems.forEach(m => m.addEventListener("click", () => window.switchSection(m.dataset.section)));

  // 가운데 커피 클릭 시 카페 주문 탭으로 이동
  const centerCoffee = document.getElementById("desk-center-coffee");
  if (centerCoffee) {
    centerCoffee.addEventListener("click", () => {
      window.switchSection("cafe");
    });
  }

  // 3. 스팟 선택 및 비디오 + 사운드 자동 송출
  const videoEl = document.getElementById("bg-video");
  const stampBtns = document.querySelectorAll(".spot-stamp-btn");

  function setSpot(spotId) {
    const spot = window.SNU_SPOTS.find(s => s.id === spotId);
    if (!spot || !videoEl) return;

    stampBtns.forEach(b => b.classList.toggle("active", b.dataset.spot === spotId));

    // 비디오 전환
    videoEl.style.opacity = "0.3";
    setTimeout(() => {
      videoEl.poster = spot.poster;
      videoEl.src = spot.videoUrl;
      videoEl.load();
      videoEl.play().catch(() => {});
      videoEl.style.opacity = "1";
    }, 250);

    // 전용 앰비언트 사운드 자동 송출
    if (window.spotAudio) {
      window.spotAudio.playSpotSound(spot.soundType);
    }

    if (window.showToast) {
      window.showToast(`📍 ${spot.name}`);
    }
  }

  stampBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const spotId = btn.dataset.spot;
      if (spotId) setSpot(spotId);
    });
  });

  // 4. 네비게이션 빠른 볼륨 & Mute 컨트롤
  const muteBtn = document.getElementById("quick-mute-btn");
  const volSlider = document.getElementById("quick-vol-slider");

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      if (window.spotAudio) {
        const isMuted = window.spotAudio.toggleMute();
        muteBtn.textContent = isMuted ? "🔇" : "🔊";
      }
    });
  }

  if (volSlider) {
    volSlider.addEventListener("input", (e) => {
      if (window.spotAudio) {
        window.spotAudio.setVolume(parseFloat(e.target.value));
      }
    });
  }

  // 5. 모듈 초기화
  if (window.compactTimer) window.compactTimer.initUI();
  if (window.cafeController) window.cafeController.initUI();

  // 첫 스팟(자하연) 세팅
  setSpot("jahayeon");

  // 첫 터치 시 오디오/비디오 자동재생 해제 지원
  document.body.addEventListener("click", () => {
    if (window.spotAudio) window.spotAudio.unlock();
    if (videoEl && videoEl.paused) videoEl.play().catch(() => {});
  }, { once: true });
});

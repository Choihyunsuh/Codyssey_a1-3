# 🏛️ study with SNU

> 서울대학교 캠퍼스 명소의 앰비언트 영상과 전용 사운드 속에서 몰입하는 카공 뽀모도로 웹 서비스

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)
[![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla_JS-F7DF1E?logo=javascript)](https://developer.mozilla.org)
[![Python 3](https://img.shields.io/badge/Backend-Python_Serverless-3776AB?logo=python)](https://python.org)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_3.5_Flash_Lite-8E75B2?logo=google)](https://deepmind.google/technologies/gemini)

---

## 📌 1. 서비스 소개

**study with SNU**는 서울대학교 공식 인스타그램 배포 및 대학생 학습 환경(노트북 와이드 뷰 & 모바일 반응형)에 맞춘 감성 카공 뽀모도로 서비스입니다.

- **온글잎 민혜체 & 아기자기한 손그림 디자인**: 따뜻한 크림/버터 베이지 톤과 투박한 손그림 드로잉 라인 적용
- **배경 중심 & 가운데 하단 커피**: 풍경이 시원하게 트이는 엽서형 데스크 뷰와 화면 중앙 하단 커피 머그 & 응원 말풍선
- **스팟별 맞춤 사운드 자동 송출**: 자하연(물+비), 잔디광장(바람), 관정도서관(도서관), 사회대 16동(카페) 자동 페이드 전환
- **미니 뽀모도로 타이머**: 시각적 방해를 줄인 아담한 상단 위젯 (25분 집중 / 5분 휴식 / 15분 긴 휴식)
- **AI 바리스타 맞춤 주문서 & 손그림 영수증**: 이름, 과목, 목표, 이모지 컨디션, 무드에 맞춘 Gemini 3.5 Flash Lite 기반 힐링 영수증

---

## 🛠️ 2. 기술 스택 (Tech Stack)

### Frontend
- **HTML5 & CSS3**: Vanilla HTML/CSS, 온글잎 민혜체 웹폰트, 손그림 Doodle UI, 반응형 뷰포트
- **Vanilla JavaScript**: Web Audio API 사운드 합성 엔진, LocalStorage 세션 통계

### Backend & Serverless
- **Vercel Serverless Functions**: `api/order.py` (Python 3.9+)
- **AI Model**: Google Gemini (`gemini-3.5-flash-lite`)

---

## 🚀 3. 로컬 실행 방법

```bash
# 프로젝트 루트 디렉터리에서 실행
python3 -m http.server 8000
```
웹 브라우저에서 `http://localhost:8000`으로 접속합니다.

---

## 🔑 4. 환경 변수 설정

Vercel 대시보드 또는 로컬 `.env` 파일에 발급받은 Gemini API Key를 등록합니다:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

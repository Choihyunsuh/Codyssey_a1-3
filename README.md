# 🏛️ SNU Study Cafe (서울대 카공 뽀모도로)

> 언제 어디서나 서울대학교 캠퍼스 명소의 앰비언트 영상과 백색소음 속에서 몰입하는 카공 뽀모도로 웹 서비스

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)
[![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla_JS-F7DF1E?logo=javascript)](https://developer.mozilla.org)
[![Python 3](https://img.shields.io/badge/Backend-Python_Serverless-3776AB?logo=python)](https://python.org)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_1.5_Flash-8E75B2?logo=google)](https://deepmind.google/technologies/gemini)

---

## 📌 1. 서비스 소개

**SNU Study Cafe**는 서울대학교 공식 인스타그램 배포 및 대학생 학습 환경(노트북 와이드 뷰 & 모바일 반응형)에 최적화된 디지털 카공 웹 서비스입니다.

- **4대 캠퍼스 스팟 앰비언트 영상**: 자하연, 잔디광장(버들골), 관정도서관, 사회대 16동 라운지의 편안한 무한 루프 비디오 배경
- **인터벌 뽀모도로 타이머**: 25분 몰입 / 5분 휴식 인터벌 및 SVG 원형 프로그레스 인디케이터, 완료 시 청아한 차임벨 울림
- **자체 합성 앰비언트 사운드 믹서**: Web Audio API 기반 무중단 물소리, 빗소리, 도서관 백색소음, 카페 소음 볼륨 믹싱
- **느티나무 카페 & Gemini AI 바리스타**: 서울대 실존 교내 카페 '느티나무'의 인기 메뉴(리딸라, 말차라떼, 아메리카노 등)를 기반으로 오늘의 목표와 컨디션에 맞춘 맞춤 음료 및 감성 영수증 발행

---

## 🛠️ 2. 기술 스택 (Tech Stack)

### Frontend
- **HTML5 & CSS3**: Vanilla HTML/CSS, Flexbox/Grid, Dynamic Viewport Height (`100dvh`), 글래스모피즘 UI
- **Vanilla JavaScript (ES6+)**: 모듈형 구조, Web Audio API 사운드 합성기, LocalStorage 세션 영속화 (프레임워크 배제)

### Backend & Serverless
- **Vercel Serverless Functions (Python 3.9+)**: `api/order.py` 엔드포인트
- **AI Model**: Google Gemini (`gemini-1.5-flash`) REST API 연동

### Deployment
- **Vercel**: GitHub 연동 자동 CI/CD 배포

---

## 📂 3. 디렉토리 구조

```text
Codyssey_a1-3/
├── api/
│   └── order.py             # Vercel Serverless Function (Python Gemini 연동)
├── css/
│   ├── style.css            # 글로벌 스타일, 네비게이션, 반응형 설정
│   ├── desk.css             # 스터디 데스크, 뽀모도로 타이머, 비디오 레이아웃
│   └── cafe.css             # 느티나무 카페 키오스크 및 영수증 티켓 스타일
├── js/
│   ├── spots.js             # 서울대 4대 스팟 비디오 및 메타데이터
│   ├── audio.js             # Web Audio API 앰비언트 사운드 합성 엔진
│   ├── timer.js             # 뽀모도로 타이머 인터벌 & 로컬스토리지 통계
│   ├── cafe.js              # AI 키오스크 주문 로직 및 영수증 렌더링
│   └── main.js              # 탭 네비게이션 및 전역 컨트롤러
├── docs/
│   └── plan.md              # [제출 패키지 4] 서비스 기획서
├── index.html               # 메인 단일 페이지 (3개 섹션 포함)
├── requirements.txt         # 백엔드 Python 의존성
├── vercel.json              # Vercel 라우팅 및 런타임 설정
├── .gitignore               # 환경변수 및 빌드 산출물 제외
└── README.md                # 서비스 소개 및 실행 가이드
```

---

## 🚀 4. 로컬 실행 방법 (Local Development)

### 4.1. 정적 프론트엔드 실행
Python 내장 웹서버를 통해 손쉽게 로컬에서 테스트할 수 있습니다:

```bash
# 프로젝트 루트 디렉터리에서 실행
python3 -m http.server 8000
```
웹 브라우저에서 `http://localhost:8000`으로 접속합니다.

### 4.2. Vercel 로컬 서버리스 환경 실행 (선택)
Vercel CLI를 사용하면 백엔드 Python 서버리스 함수까지 로컬에서 동시에 구동할 수 있습니다:

```bash
# Vercel CLI 설치 (Node.js 필요)
npm install -g vercel

# 로컬 개발 서버 구동
vercel dev
```

---

## 🔑 5. 환경 변수 (Environment Variables) 설정

보안을 위해 AI API Key는 코드에 절대 노출하지 않으며, Vercel 대시보드 환경 변수로 등록합니다.

### 5.1. 로컬 환경 (`.env` 파일)
프로젝트 루트 디렉터리에 `.env` 파일을 생성하고 발급받은 Google Gemini API Key를 입력합니다:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(참고: `.env` 파일은 `.gitignore`에 등록되어 있어 GitHub에 커밋되지 않습니다)*

### 5.2. Vercel 배포 환경 설정
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인합니다.
2. 배포된 프로젝트 선택 → **Settings** → **Environment Variables** 메뉴로 이동합니다.
3. 다음과 같이 키-값을 추가합니다:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `발급받은_Gemini_API_키`
4. 저장 후 프로젝트를 다시 배포(Redeploy)합니다.

---

## 🌐 6. 배포 URL (Deployment URL)

- **Vercel 배포 URL**: `https://<your-project-name>.vercel.app` *(Vercel 연동 후 업데이트 예정)*

---

## 🛡️ 7. AI 실패 처리 및 안정성 설계 (과제 요건)
1. **필수 입력값 누락**: 공부 과목 미입력 시 API를 호출하지 않고 흔들림 애니메이션과 함께 안내 문구 출력
2. **지연 및 타임아웃 방어**: 주문 즉시 감성적인 로딩 애니메이션 노출 (8초 타임아웃 방어)
3. **API 오류 격리**: 네트워크 에러 또는 API 쿼터 초과 시 기본 느티나무 인기 메뉴(아이스 아메리카노 등)로 구성된 스마트 Fallback 영수증을 즉시 서빙하여 사용자 경험 중단 방지

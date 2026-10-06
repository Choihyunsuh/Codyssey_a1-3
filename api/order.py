import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

# 서울대학교 느티나무 인기 음료 및 메타데이터
NEUTINAMU_MENU = {
    "리딸라 (리얼딸기라떼)": "서울대 느티나무의 시그니처 1티어 음료. 묵직한 생딸기 청과 신선한 우유의 달콤한 당 충전 조합",
    "말차라떼": "진하고 쌉싸름한 녹차 풍미로 차분하게 마음을 가라앉히고 잡념을 없애주는 힐링 메뉴",
    "아이스 아메리카노": "관정 열람실 밤샘러들의 든든한 동반자. 군더더기 없이 깔끔하고 진한 다크 로스팅 카페인 부스터",
    "카페라떼": "부드러운 에스프레소와 고소한 스팀 밀크로 장시간 지속되는 몰입을 돕는 스테디셀러",
    "자몽허니블랙티": "달콤 쌉싸름한 자몽과 은은한 홍차 향으로 나른해진 오후를 상쾌하게 깨워주는 산뜻한 메뉴"
}

def call_gemini(task, condition, drink_preference):
    """Google Gemini API를 호출하여 맞춤 추천 및 응원 문구를 생성합니다."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None

    # 프롬프트 구성 ('관악선배' 호칭 전면 배제, 담백하고 따뜻한 바리스타 감성)
    system_instruction = (
        "당신은 서울대학교 교내 카페 '느티나무'의 친절하고 센스 있는 AI 바리스타입니다. "
        "사용자의 공부 과목과 현재 컨디션을 고려하여, 느티나무 카페의 인기 음료 중 가장 알맞은 것을 추천하고, "
        "담백하고 따뜻한 동기부여 응원 멘트(2~3문장)와 집중 팁(1문장)을 작성해주세요. "
        "주의: '선배', '관악선배', '후배' 같은 호칭은 절대 사용하지 마세요. "
        "반드시 순수한 JSON 형식으로만 응답해야 합니다. 다른 텍스트는 일체 출력하지 마세요.\n"
        "응답 형식: {\"recommendedDrink\": \"음료명\", \"drinkTagline\": \"음료 한줄설명\", \"motivationMessage\": \"응원멘트\", \"studyTip\": \"팁\"}"
    )

    user_prompt = (
        f"공부 과목/목표: {task}\n"
        f"현재 컨디션: {condition}\n"
        f"희망 음료 베이스: {drink_preference}\n"
        f"선택 가능한 느티나무 메뉴: {', '.join(NEUTINAMU_MENU.keys())}"
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": system_instruction + "\n\n" + user_prompt}
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.7
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=7) as response:
        result = json.loads(response.read().decode("utf-8"))
        text_content = result["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text_content)


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # CORS 사전 요청 대응
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data.decode("utf-8"))
        except Exception:
            self.send_error_response(400, "잘못된 JSON 요청 형식입니다.")
            return

        task = data.get("task", "").strip()
        condition = data.get("condition", "피곤함").strip()
        drink_pref = data.get("drinkPreference", "아이스 아메리카노").strip()

        # 필수값 누락 검증 (과제 요구사항)
        if not task:
            self.send_error_response(400, "오늘 집중할 과목이나 목표를 입력해주세요.")
            return

        # Gemini API 호출 시도
        ai_result = None
        try:
            ai_result = call_gemini(task, condition, drink_pref)
        except Exception as e:
            # 로깅 후 지능형 Fallback으로 계속 진행
            print(f"[Gemini API Warning]: {e}")

        # AI 결과가 없거나 실패한 경우 Fallback 응답 구성
        if not ai_result or not isinstance(ai_result, dict):
            matched_drink = drink_pref if drink_pref in NEUTINAMU_MENU else "리딸라 (리얼딸기라떼)"
            ai_result = {
                "recommendedDrink": matched_drink,
                "drinkTagline": NEUTINAMU_MENU.get(matched_drink, "느티나무의 대표 인기 음료"),
                "motivationMessage": f"'{task}'을(를) 향한 첫 걸음을 응원합니다. 작은 몰입의 순간들이 쌓여 값진 성취가 됩니다. 이번 25분만큼은 눈앞의 한 걸음에만 집중해 보세요.",
                "studyTip": "첫 5분 동안 뇌가 시동을 걸 수 있도록 책상 위 불필요한 물건을 정리해보세요."
            }

        # 주문 번호 생성
        import random
        ai_result["orderNumber"] = f"SNU-{random.randint(1000, 9999)}"

        # 200 OK 응답 반환
        response_bytes = json.dumps(ai_result, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def send_error_response(self, status_code, message):
        error_body = json.dumps({"error": message}, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(error_body)))
        self.end_headers()
        self.wfile.write(error_body)


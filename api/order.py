import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

POPULAR_DRINKS = ["리딸라", "말차라떼", "아메리카노", "카페라떼", "자몽허니티"]

def call_gemini(name, subject, goal, condition, mood, drink_pref):
    """Google Gemini API (gemini-3.5-flash-lite) 호출"""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None

    system_instruction = (
        "당신은 서울대 학생들을 위한 디지털 카공 서비스 'study with SNU'의 친절하고 다정한 AI 바리스타입니다. "
        "사용자의 이름, 공부 과목, 세부 목표, 컨디션, 원하는 무드를 바탕으로, "
        "따뜻하고 담백한 손글씨 느낌의 응원 멘트(1~2문장)를 작성해 주세요. "
        "주의: '선배', '관악선배', '후배' 호칭은 절대 쓰지 말고, 사용자 이름(예: 00님)을 부르며 다정하게 격려해주세요. "
        "반드시 JSON 형식으로만 응답해야 합니다: {\"recommendedDrink\": \"음료명\", \"motivationMessage\": \"응원문구\"}"
    )

    user_prompt = (
        f"이름: {name}\n"
        f"공부 과목: {subject}\n"
        f"세부 목표: {goal}\n"
        f"현재 컨디션: {condition}\n"
        f"원하는 무드: {mood}\n"
        f"선택한 음료: {drink_pref}"
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={api_key}"
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
            self.send_error_response(400, "잘못된 JSON 형식입니다.")
            return

        name = data.get("name", "학우").strip()
        subject = data.get("subject", "").strip()
        goal = data.get("goal", "").strip()
        condition = data.get("condition", "피곤").strip()
        mood = data.get("mood", "집중").strip()
        drink_pref = data.get("drinkPreference", "아메리카노").strip()

        if not subject:
            self.send_error_response(400, "공부할 과목을 입력해주세요.")
            return

        ai_result = None
        try:
            ai_result = call_gemini(name, subject, goal, condition, mood, drink_pref)
        except Exception as e:
            print(f"[Gemini API Warning]: {e}")

        if not ai_result or not isinstance(ai_result, dict):
            matched_drink = drink_pref if drink_pref in POPULAR_DRINKS else "리딸라"
            ai_result = {
                "recommendedDrink": matched_drink,
                "motivationMessage": f"{name}님, {subject} 몰입 준비 완료! 이번 25분 차분하게 달려봐요."
            }

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

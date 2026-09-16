import os
import logging

import stripe
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from google import genai
from google.genai import types

logger = logging.getLogger("led_diagnosis")

app = FastAPI()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB

REQUIRED_ENV_VARS = (
    "GEMINI_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_ID",
    "CHECKOUT_SUCCESS_URL",
    "CHECKOUT_CANCEL_URL",
)


gemini_client: genai.Client | None = None


@app.on_event("startup")
def validate_environment() -> None:
    global gemini_client

    missing = [name for name in REQUIRED_ENV_VARS if not os.environ.get(name)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

    gemini_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    stripe.api_key = os.environ["STRIPE_SECRET_KEY"]


@app.post("/diagnose")
async def diagnose_and_checkout(file: UploadFile = File(...)):
    # 1. アップロードされたファイルを検証する
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="対応していないファイル形式です。画像をアップロードしてください。")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="ファイルが空です。")
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="ファイルサイズが大きすぎます（最大10MB）。")

    # 2. Gemini 2.5 Flash（超高速・高精度モデル）で画像診断
    prompt = """
    この画像（照明または電気代の検針票）を分析してください。
    1. 現状の課題（蛍光灯の種類や想定されるムダな電気代）
    2. LED化した場合の毎月の削減見込み額（円）
    3. 推奨する月額サブスク料金（削減額の約60%）
    上記を短く分かりやすく店舗オーナー向けに出力してください。
    """
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                prompt,
                types.Part.from_bytes(data=contents, mime_type=file.content_type),
            ],
        )
        diagnosis_text = response.text
    except Exception:
        logger.exception("Gemini diagnosis failed")
        raise HTTPException(status_code=502, detail="画像の診断中にエラーが発生しました。しばらくしてから再度お試しください。")

    # 3. Stripeのサブスク決済ページ（Checkout）URLを動的に生成
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": os.environ["STRIPE_PRICE_ID"],
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=os.environ["CHECKOUT_SUCCESS_URL"],
            cancel_url=os.environ["CHECKOUT_CANCEL_URL"],
        )
    except stripe.error.StripeError:
        logger.exception("Stripe checkout session creation failed")
        raise HTTPException(status_code=502, detail="決済ページの作成中にエラーが発生しました。しばらくしてから再度お試しください。")

    # AIの診断結果とStripeの決済URLを返す
    return JSONResponse(
        {
            "diagnosis": diagnosis_text,
            "checkout_url": checkout_session.url,
        }
    )

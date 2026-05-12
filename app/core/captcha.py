import httpx
import os
from fastapi import HTTPException

HCAPTCHA_SECRET_KEY = os.getenv("HCAPTCHA_SECRET_KEY")
HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify"

async def verify_hcaptcha(token: str):
    """
    Verifies the hCaptcha token with the hCaptcha API.
    """
    if not HCAPTCHA_SECRET_KEY:
        # If secret key is not set, we skip verification (useful for dev)
        # But in production, this should probably be an error or a warning
        print("WARNING: HCAPTCHA_SECRET_KEY not set. Skipping verification.")
        return True

    async with httpx.AsyncClient() as client:
        response = await client.post(
            HCAPTCHA_VERIFY_URL,
            data={
                "secret": HCAPTCHA_SECRET_KEY,
                "response": token
            }
        )
        data = response.json()
        
        if not data.get("success"):
            raise HTTPException(
                status_code=400, 
                detail=f"Captcha verification failed: {data.get('error-codes', ['unknown error'])}"
            )
        
    return True

import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

async def send_otp_email(email: str, otp: str, full_name: str):
    try:
        params = {
            "from": "QuickMart <onboarding@resend.dev>",
            "to": [email],
            "subject": "QuickMart - Password Reset OTP",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #E05A2B;">QuickMart Password Reset</h2>
                <p>Hello <strong>{full_name}</strong>,</p>
                <p>You requested to reset your password. Use the OTP below:</p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #1A1A2E; font-size: 48px; letter-spacing: 10px; margin: 0;">{otp}</h1>
                </div>
                <p style="color: #666;">This OTP expires in <strong>10 minutes</strong>.</p>
                <p style="color: #666;">If you didn't request this, ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">QuickMart - Your Campus Marketplace</p>
            </div>
            """
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False
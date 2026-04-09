import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

PROMO_CODE = "KETO50"


def _base_template(content: str) -> str:
    return f"""
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                background:#F9F5F0;padding:40px 20px;min-height:100vh;">
      <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:20px;
                  overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#E8620A,#C4500A);
                    padding:32px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.2);
                      border-radius:16px;padding:14px 20px;margin-bottom:12px;">
            <span style="font-size:32px;">🔥</span>
          </div>
          <div style="color:#fff;font-size:22px;font-weight:800;
                      letter-spacing:-0.5px;">KetoCoach</div>
        </div>
        <!-- Body -->
        <div style="padding:36px 40px;">
          {content}
        </div>
        <!-- Footer -->
        <div style="padding:24px 40px;border-top:1px solid #F0EBE4;
                    text-align:center;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">
            © 2026 KetoCoach ·
            <a href="{settings.FRONTEND_URL}" style="color:#E8620A;">keto-coach.app</a>
          </p>
        </div>
      </div>
    </div>
    """


def _welcome_html(full_name: str) -> str:
    name = full_name.split()[0] if full_name else "there"
    content = f"""
      <h1 style="color:#1A1A1A;font-size:26px;font-weight:800;margin:0 0 8px;">
        Welcome, {name}! 🎉
      </h1>
      <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Your keto journey starts now. KetoCoach will generate personalized meal plans,
        track your macros, and coach you 24/7 with AI — all tailored to your goals.
      </p>

      <!-- Promo banner -->
      <div style="background:linear-gradient(135deg,#FFF7F0,#FFE8D6);
                  border:1.5px solid #FFD4B2;border-radius:16px;
                  padding:24px;margin-bottom:28px;text-align:center;">
        <div style="font-size:13px;font-weight:700;color:#E8620A;
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
          🎁 Exclusive offer for new members
        </div>
        <p style="color:#1A1A1A;font-size:15px;margin:0 0 16px;line-height:1.5;">
          Subscribe to our newsletter and get <strong>50% off your first month</strong>
          of Pro or Elite — for <strong>new subscribers only</strong>.
        </p>
        <div style="background:#E8620A;color:#fff;display:inline-block;
                    padding:12px 28px;border-radius:10px;font-size:22px;
                    font-weight:900;letter-spacing:2px;">
          {PROMO_CODE}
        </div>
        <p style="color:#9CA3AF;font-size:12px;margin:10px 0 0;">
          Valid for 1 month · Subscribe to the newsletter below to activate
        </p>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="{settings.FRONTEND_URL}/register"
           style="background:#E8620A;color:#fff;padding:14px 36px;border-radius:12px;
                  text-decoration:none;font-weight:700;font-size:16px;
                  display:inline-block;">
          Go to my dashboard →
        </a>
      </div>

      <div style="background:#F9F5F0;border-radius:12px;padding:20px;">
        <p style="color:#6B7280;font-size:13px;margin:0 0 10px;font-weight:600;">
          What's waiting for you:
        </p>
        <ul style="color:#4B5563;font-size:14px;margin:0;padding-left:18px;
                   line-height:1.8;">
          <li>🥑 Personalized weekly keto meal plans</li>
          <li>🤖 24/7 AI nutrition coach</li>
          <li>📊 Automatic macro tracking</li>
          <li>🛒 Smart shopping lists</li>
        </ul>
      </div>
    """
    return _base_template(content)


def _newsletter_confirmation_html(email: str) -> str:
    content = f"""
      <h1 style="color:#1A1A1A;font-size:26px;font-weight:800;margin:0 0 8px;">
        You're in! 🎉
      </h1>
      <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Thanks for subscribing to the KetoCoach newsletter.
        You'll receive keto tips, recipes, and exclusive offers every week.
      </p>

      <!-- Promo code activated -->
      <div style="background:linear-gradient(135deg,#ECFDF5,#D1FAE5);
                  border:1.5px solid #6EE7B7;border-radius:16px;
                  padding:24px;margin-bottom:28px;text-align:center;">
        <div style="font-size:13px;font-weight:700;color:#059669;
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
          ✅ Your promo code is activated
        </div>
        <p style="color:#1A1A1A;font-size:15px;margin:0 0 16px;">
          Use this code at checkout for <strong>50% off your first month</strong>:
        </p>
        <div style="background:#059669;color:#fff;display:inline-block;
                    padding:12px 28px;border-radius:10px;font-size:22px;
                    font-weight:900;letter-spacing:2px;">
          {PROMO_CODE}
        </div>
        <p style="color:#9CA3AF;font-size:12px;margin:10px 0 0;">
          Valid on Pro (14€/month) and Elite (29€/month) · 1 month only
        </p>
      </div>

      <div style="text-align:center;">
        <a href="{settings.FRONTEND_URL}/#pricing"
           style="background:#E8620A;color:#fff;padding:14px 36px;border-radius:12px;
                  text-decoration:none;font-weight:700;font-size:16px;
                  display:inline-block;">
          See plans →
        </a>
      </div>
    """
    return _base_template(content)


def _send_email(to_email: str, subject: str, html: str):
    print(f"[EMAIL] Sending to {to_email}", flush=True)
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_EMAIL, to_email, msg.as_string())
        print(f"[EMAIL] ✓ Sent successfully to {to_email}", flush=True)
    except Exception as e:
        print(f"[EMAIL] ✗ Failed: {e}", flush=True)


def send_welcome_email(email: str, full_name: str):
    print(f"[EMAIL] send_welcome_email called for {email}, SMTP_EMAIL set: {bool(settings.SMTP_EMAIL)}", flush=True)
    if not settings.SMTP_EMAIL:
        print("[EMAIL] SMTP_EMAIL not configured — skipping", flush=True)
        return
    html = _welcome_html(full_name)
    _send_email(email, "Welcome to KetoCoach 🔥 — Your 50% offer inside", html)


def send_newsletter_confirmation(email: str):
    print(f"[EMAIL] send_newsletter_confirmation called for {email}, SMTP_EMAIL set: {bool(settings.SMTP_EMAIL)}", flush=True)
    if not settings.SMTP_EMAIL:
        print("[EMAIL] SMTP_EMAIL not configured — skipping", flush=True)
        return
    html = _newsletter_confirmation_html(email)
    _send_email(email, f"✅ Your code {PROMO_CODE} is ready — 50% off KetoCoach Pro", html)

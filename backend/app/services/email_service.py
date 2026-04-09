import logging
import urllib.request
import json
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

      <!-- Newsletter CTA -->
      <div style="background:linear-gradient(135deg,#FFF7F0,#FFE8D6);
                  border:1.5px solid #FFD4B2;border-radius:16px;
                  padding:24px;margin-bottom:20px;text-align:center;">
        <div style="font-size:13px;font-weight:700;color:#E8620A;
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
          🎁 Exclusive offer — new members only
        </div>
        <p style="color:#1A1A1A;font-size:15px;margin:0 0 16px;line-height:1.6;">
          Subscribe to the <strong>KetoCoach newsletter</strong> and receive a promo code
          for <strong>50% off your first month</strong> of Pro or Elite.
          <br/>Keto tips, recipes &amp; exclusive deals every week.
        </p>
        <a href="{settings.FRONTEND_URL}/#newsletter"
           style="background:#E8620A;color:#fff;padding:13px 30px;border-radius:10px;
                  text-decoration:none;font-weight:700;font-size:15px;
                  display:inline-block;">
          Subscribe &amp; get 50% off →
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin:10px 0 0;">
          Offer valid for 1 month · Code sent directly to your inbox
        </p>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="{settings.FRONTEND_URL}/dashboard"
           style="background:#1A1A1A;color:#fff;padding:13px 30px;border-radius:10px;
                  text-decoration:none;font-weight:700;font-size:15px;
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
        payload = json.dumps({
            "from": settings.EMAIL_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
                "User-Agent": "KetoCoach/1.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode()
            print(f"[EMAIL] ✓ Sent successfully to {to_email} | {body}", flush=True)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"[EMAIL] ✗ HTTP {e.code}: {body}", flush=True)
    except Exception as e:
        print(f"[EMAIL] ✗ Failed: {e}", flush=True)


def send_welcome_email(email: str, full_name: str):
    print(f"[EMAIL] send_welcome_email called for {email}, RESEND_API_KEY set: {bool(settings.RESEND_API_KEY)}", flush=True)
    if not settings.RESEND_API_KEY:
        print("[EMAIL] RESEND_API_KEY not configured — skipping", flush=True)
        return
    html = _welcome_html(full_name)
    _send_email(email, "Welcome to KetoCoach 🔥 — Your 50% offer inside", html)


def _subscription_confirmation_html(full_name: str, plan: str) -> str:
    name = full_name.split()[0] if full_name else "there"
    plan_label = "Pro" if plan == "pro" else "Elite"
    price = "14€" if plan == "pro" else "29€"
    features = [
        "Unlimited weekly meal plans",
        "Unlimited AI Coach messages",
        "Instant meal swaps",
        "Full macro tracking",
        "Progress analytics",
        "Keto & carnivore modes",
    ] if plan == "pro" else [
        "Everything in Pro",
        "Custom meal creation",
        "Advanced analytics",
        "Priority support",
        "Export PDF plans",
        "Family mode (4 profiles)",
    ]
    features_html = "".join(
        f'<li style="padding:5px 0;color:#4B5563;font-size:14px;">✅ {f}</li>'
        for f in features
    )
    content = f"""
      <h1 style="color:#1A1A1A;font-size:26px;font-weight:800;margin:0 0 8px;">
        Welcome to {plan_label}, {name}! 🎉
      </h1>
      <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Your subscription is now active. You have full access to all {plan_label} features.
      </p>

      <div style="background:linear-gradient(135deg,#FFF7F0,#FFE8D6);
                  border:1.5px solid #FFD4B2;border-radius:16px;
                  padding:24px;margin-bottom:24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div>
            <div style="font-size:13px;font-weight:700;color:#E8620A;
                        text-transform:uppercase;letter-spacing:1px;">Active plan</div>
            <div style="font-size:24px;font-weight:900;color:#1A1A1A;margin-top:4px;">
              KetoCoach {plan_label}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:28px;font-weight:900;color:#E8620A;">{price}</div>
            <div style="font-size:13px;color:#9CA3AF;">/month</div>
          </div>
        </div>
        <ul style="margin:0;padding-left:0;list-style:none;">
          {features_html}
        </ul>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="{settings.FRONTEND_URL}/dashboard"
           style="background:#E8620A;color:#fff;padding:14px 36px;border-radius:12px;
                  text-decoration:none;font-weight:700;font-size:16px;
                  display:inline-block;">
          Go to my dashboard →
        </a>
      </div>

      <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0;">
        You can manage your subscription anytime from your dashboard.
      </p>
    """
    return _base_template(content)


def send_subscription_confirmation(email: str, full_name: str, plan: str):
    print(f"[EMAIL] send_subscription_confirmation for {email} plan={plan}", flush=True)
    if not settings.RESEND_API_KEY:
        return
    html = _subscription_confirmation_html(full_name, plan)
    _send_email(email, f"🎉 Your KetoCoach {plan.title()} subscription is active!", html)


def send_newsletter_confirmation(email: str):
    print(f"[EMAIL] send_newsletter_confirmation called for {email}, RESEND_API_KEY set: {bool(settings.RESEND_API_KEY)}", flush=True)
    if not settings.RESEND_API_KEY:
        print("[EMAIL] RESEND_API_KEY not configured — skipping", flush=True)
        return
    html = _newsletter_confirmation_html(email)
    _send_email(email, f"✅ Your code {PROMO_CODE} is ready — 50% off KetoCoach Pro", html)

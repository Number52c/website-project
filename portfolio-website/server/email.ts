/**
 * server/email.ts
 * Transactional email helpers using the Resend API.
 * Branded HTML templates in Ortiz navy/gold/cream colors.
 */

import { ENV } from "./_core/env";

const RESEND_API = "https://api.resend.com/emails";
const FROM_ADDRESS = "Ortiz Insurance <eortiz@ortizinsurancebroker.com>";
const ANNUAL_REVIEW_FROM = "Erika Ortiz <eortiz@ortizinsurancebroker.com>";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  const apiKey = ENV.resendApiKey;
  if (!apiKey) {
    console.error("[Email] RESEND_API_KEY is not set — add it in Settings → Secrets");
    return false;
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (res.ok) {
      const data: any = await res.json();
      console.log(`[Email] Sent successfully (id: ${data.id})`);
      return true;
    }

    const err = await res.text();
    console.error(`[Email] Resend error ${res.status}: ${err}`);
    return false;
  } catch (e) {
    console.error("[Email] Network error:", e);
    return false;
  }
}

export function buildContactEmail(data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; background: #F5F0E8; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E8E0D0; border-radius: 4px; overflow: hidden;">

    <!-- Header -->
    <div style="background: #0D1B3E; padding: 24px 32px;">
      <h1 style="color: #C9A84C; font-size: 22px; margin: 0; letter-spacing: 1px;">NEW CONTACT FORM SUBMISSION</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 6px 0 0; font-family: Arial, sans-serif;">Ortiz Insurance Broker — OrtizInsuranceBroker.com</p>
    </div>

    <!-- Lead Details -->
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;">
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #888; width: 140px; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Name</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #0D1B3E; font-weight: bold;">${data.name}</td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #888; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #0D1B3E;"><a href="mailto:${data.email}" style="color: #C9A84C;">${data.email}</a></td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #888; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #0D1B3E;">${data.phone || "—"}</td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #888; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Subject</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #0D1B3E;">${data.subject || "—"}</td></tr>
      </table>

      <!-- Message Body -->
      <div style="margin-top: 24px;">
        <p style="font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px;">Message</p>
        <div style="background: #F5F0E8; border-left: 3px solid #C9A84C; padding: 16px; color: #0D1B3E; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">${data.message.replace(/\n/g, "<br>")}</div>
      </div>

      <!-- One-click reply button -->
      <div style="margin-top: 28px; text-align: center;">
        <a href="mailto:${data.email}" style="display: inline-block; background: #C9A84C; color: #0D1B3E; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 12px 28px; text-decoration: none; border-radius: 2px;">Reply to ${data.name.split(" ")[0]}</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #0D1B3E; padding: 16px 32px; text-align: center;">
      <p style="color: rgba(255,255,255,0.4); font-family: Arial, sans-serif; font-size: 11px; margin: 0;">Ortiz Insurance Broker · 5333 Yorktown Blvd, Corpus Christi, TX 78413 · (361) 613-8336</p>
    </div>

  </div>
</body>
</html>`;
}

export function buildQuoteEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  coverage: string;
  bestTime: string;
  message: string;
}): string {
  const bestTimeLabel: Record<string, string> = {
    morning: "Morning (8am – 12pm)",
    afternoon: "Afternoon (12pm – 5pm)",
    evening: "Evening (5pm – 7pm)",
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; background: #F5F0E8; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E8E0D0; border-radius: 4px; overflow: hidden;">

    <!-- Header -->
    <div style="background: #0D1B3E; padding: 24px 32px;">
      <h1 style="color: #C9A84C; font-size: 22px; margin: 0; letter-spacing: 1px;">NEW QUOTE REQUEST</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 6px 0 0; font-family: Arial, sans-serif;">Ortiz Insurance Broker — OrtizInsuranceBroker.com</p>
    </div>

    <!-- Lead Details -->
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;">
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #888; width: 160px; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Name</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #0D1B3E; font-weight: bold;">${data.firstName} ${data.lastName}</td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #888; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #0D1B3E;"><a href="mailto:${data.email}" style="color: #C9A84C;">${data.email}</a></td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #888; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #0D1B3E;">${data.phone}</td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #888; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Coverage Type</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; font-weight: bold; color: #C9A84C;">${data.coverage}</td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #888; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Best Time</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D0; color: #0D1B3E;">${bestTimeLabel[data.bestTime] || "No preference"}</td></tr>
      </table>

      ${data.message ? `
      <div style="margin-top: 24px;">
        <p style="font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px;">Additional Notes</p>
        <div style="background: #F5F0E8; border-left: 3px solid #C9A84C; padding: 16px; color: #0D1B3E; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">${data.message.replace(/\n/g, "<br>")}</div>
      </div>` : ""}

      <!-- One-click reply button -->
      <div style="margin-top: 28px; text-align: center;">
        <a href="mailto:${data.email}" style="display: inline-block; background: #C9A84C; color: #0D1B3E; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 12px 28px; text-decoration: none; border-radius: 2px;">Reply to ${data.firstName}</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #0D1B3E; padding: 16px 32px; text-align: center;">
      <p style="color: rgba(255,255,255,0.4); font-family: Arial, sans-serif; font-size: 11px; margin: 0;">Ortiz Insurance Broker · 5333 Yorktown Blvd, Corpus Christi, TX 78413 · (361) 613-8336</p>
    </div>

  </div>
</body>
</html>`;
}


export function buildAnnualReviewEmail(data: {
  clientName: string;
  policyNumber: string;
  carrier: string;
  effectiveDate: Date;
  reviewDueDate: Date;
  portalUrl: string;
}): string {
  const reviewDate = new Date(data.effectiveDate);
  reviewDate.setFullYear(reviewDate.getFullYear() + 1);
  
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; background: #F5F0E8; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E8E0D0; border-radius: 4px; overflow: hidden;">

    <!-- Header -->
    <div style="background: #0D1B3E; padding: 24px 32px;">
      <h1 style="color: #C9A84C; font-size: 22px; margin: 0; letter-spacing: 1px;">TIME FOR YOUR ANNUAL REVIEW</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 6px 0 0; font-family: Arial, sans-serif;">Ortiz Insurance Broker — Your Trusted South Texas Insurance Partner</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <p style="font-family: Arial, sans-serif; font-size: 15px; color: #0D1B3E; line-height: 1.6; margin: 0 0 16px;">
        Hi <strong>${data.clientName}</strong>,
      </p>

      <p style="font-family: Arial, sans-serif; font-size: 14px; color: #0D1B3E; line-height: 1.6; margin: 0 0 16px;">
        It's time for your annual policy review! Your <strong>${data.carrier}</strong> policy (${data.policyNumber}) is due for its yearly check-in.
      </p>

      <div style="background: #F5F0E8; border-left: 4px solid #C9A84C; padding: 16px; margin: 24px 0;">
        <p style="font-family: Arial, sans-serif; font-size: 13px; color: #0D1B3E; margin: 0 0 8px; font-weight: bold;">Why Annual Reviews Matter:</p>
        <ul style="font-family: Arial, sans-serif; font-size: 13px; color: #0D1B3E; margin: 8px 0; padding-left: 20px;">
          <li>Ensure your coverage still meets your needs</li>
          <li>Review premium rates and payment options</li>
          <li>Discuss any life changes</li>
          <li>Explore new coverage opportunities</li>
        </ul>
      </div>

      <p style="font-family: Arial, sans-serif; font-size: 14px; color: #0D1B3E; line-height: 1.6; margin: 24px 0;">
        Schedule your review today by contacting us or logging into your portal to request a meeting.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.portalUrl}" style="display: inline-block; background: #C9A84C; color: #0D1B3E; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 14px 32px; text-decoration: none; border-radius: 2px;">Schedule Your Review</a>
      </div>

      <p style="font-family: Arial, sans-serif; font-size: 13px; color: #666; line-height: 1.6; margin: 24px 0;">
        Questions? Call us at <strong>(361) 613-8336</strong> or reply to this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #0D1B3E; padding: 16px 32px; text-align: center;">
      <p style="color: rgba(255,255,255,0.4); font-family: Arial, sans-serif; font-size: 11px; margin: 0;">Ortiz Insurance Broker · 5333 Yorktown Blvd, Corpus Christi, TX 78413 · (361) 613-8336</p>
    </div>

  </div>
</body>
</html>`;
}


import { Resend } from "resend";

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export const sendWelcomeEmail = async (email: string, name: string, verifyToken: string) => {
  const verifyLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/verify?token=${verifyToken}`;
  
  if (!resend) {
    console.log(`[EMAIL LOGGER] Welcome/Verify Email suppressed. Missing RESEND_API_KEY.`);
    console.log(`[EMAIL LOGGER] -> To: ${email}`);
    console.log(`[EMAIL LOGGER] -> Link: ${verifyLink}`);
    return;
  }

  try {
    await resend.emails.send({
      from: "Ascension <noreply@ascension.com>", // You must configure a verified domain in Resend
      to: email,
      subject: "Welcome to Ascension - Please Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Ascension, ${name}!</h2>
          <p>Thank you for joining. To complete your registration and secure your account, please verify your email address by clicking the link below:</p>
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email Address</a>
          <p>If you did not create this account, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};

export const sendOrderConfirmationEmail = async (email: string, name: string, orderNumber: string, items: any[], total: number) => {
  if (!resend) {
    console.log(`[EMAIL LOGGER] Order Confirmation Email suppressed. Missing RESEND_API_KEY.`);
    console.log(`[EMAIL LOGGER] -> To: ${email}`);
    console.log(`[EMAIL LOGGER] -> Order: ${orderNumber}`);
    return;
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.variant?.size || ''})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');

  try {
    await resend.emails.send({
      from: "Ascension Orders <orders@ascension.com>",
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Confirmed!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for your order! We're preparing it for shipment. Here are your order details:</p>
          
          <div style="margin: 30px 0;">
            <strong>Order Number:</strong> ${orderNumber}<br>
            <strong>Total Amount:</strong> ₹${total.toLocaleString('en-IN')}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: right;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
            ${itemsHtml}
          </table>

          <p>We'll send another email when your order ships.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
};

export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string) => {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;
  
  if (!resend) {
    console.log(`[EMAIL LOGGER] Password Reset Email suppressed. Missing RESEND_API_KEY.`);
    console.log(`[EMAIL LOGGER] -> To: ${email}`);
    console.log(`[EMAIL LOGGER] -> Link: ${resetLink}`);
    return;
  }

  try {
    await resend.emails.send({
      from: "Ascension Security <security@ascension.com>",
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the link below to choose a new one:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
};

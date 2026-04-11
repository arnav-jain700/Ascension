import nodemailer from "nodemailer";

// Create a generic Ethereal SMTP transporter for development logging
// In production, you would replace this with actual Resend, SendGrid, or AWS SES credentials
const createTransporter = async () => {
    // If we have actual SMTP credentials, use them
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Otherwise use an ephemeral internal logger to simulate SMTP firing
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    try {
        const transporter = await createTransporter();
        
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #000; text-transform: uppercase; letter-spacing: 2px;">Welcome to Ascension</h1>
            <p>Hi ${name},</p>
            <p>Welcome to Ascension. Your account has been successfully created. We are thrilled to have you join our community.</p>
            <p>Explore our latest arrivals spanning premium athleisure, curated for your comfort.</p>
            <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5; border-radius: 4px;">
                <p style="margin: 0;"><strong>Pro Tip:</strong> Complete your profile to get personalized size recommendations via our Fit Finder!</p>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
                © ${new Date().getFullYear()} Ascension. All rights reserved.
            </p>
        </div>
        `;

        const info = await transporter.sendMail({
            from: '"Ascension" <hello@ascension.com>',
            to: email,
            subject: "Welcome to Ascension",
            html,
        });

        console.log("📨 Welcome Email Sent to: " + email);
        if (!process.env.SMTP_HOST) {
            console.log("Ethereal Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (err) {
        console.error("Failed to send welcome email", err);
    }
};

export const sendOrderConfirmationEmail = async (email: string, orderData: any) => {
    try {
        const transporter = await createTransporter();
        
        // Quick template generation parsing the cart array
        const itemsHtml = orderData.items?.map((item: any) => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (x${item.quantity})</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total}</td>
            </tr>
        `).join("") || "";

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #000; text-transform: uppercase;">Order Confirmed</h1>
            <p>Thank you for your order! We'll send another email when it ships.</p>
            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                <p style="margin: 0;"><strong>Total:</strong> ₹${orderData.total}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #000; color: #fff;">
                        <th style="padding: 12px; text-align: left;">Item</th>
                        <th style="padding: 12px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <p style="font-size: 14px; line-height: 1.5;">If you have any questions, simply reply to this email.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
                © ${new Date().getFullYear()} Ascension.
            </p>
        </div>
        `;

        const info = await transporter.sendMail({
            from: '"Ascension Orders" <orders@ascension.com>',
            to: email,
            subject: `Order Confirmation #${orderData.orderNumber}`,
            html,
        });

        console.log("📨 Order Confirmation Email Sent to: " + email);
        if (!process.env.SMTP_HOST) {
            console.log("Ethereal Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (err) {
        console.error("Failed to send order confirmation email", err);
    }
};

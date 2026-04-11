export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface ShippingUpdateData {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<boolean> {
  try {
    const emailTemplate: EmailTemplate = {
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: generateOrderConfirmationHTML(data)
    };

    // In production, this would call your email service API
    // For now, we'll simulate and log the email
    console.log('📧 Order Confirmation Email:', emailTemplate);
    
    // Simulate API call
    const response = await simulateEmailAPI(emailTemplate);
    return response.success;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

/**
 * Send shipping update email
 */
export async function sendShippingUpdateEmail(data: ShippingUpdateData): Promise<boolean> {
  try {
    const emailTemplate: EmailTemplate = {
      to: data.customerName, // In production, this would be the actual customer email
      subject: `Your Order ${data.orderNumber} Has Shipped!`,
      html: generateShippingUpdateHTML(data)
    };

    console.log('📦 Shipping Update Email:', emailTemplate);
    
    const response = await simulateEmailAPI(emailTemplate);
    return response.success;
  } catch (error) {
    console.error('Failed to send shipping update email:', error);
    return false;
  }
}

/**
 * Generate HTML for order confirmation email
 */
function generateOrderConfirmationHTML(data: OrderConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Ascension</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .logo { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .content { padding: 20px 0; }
        .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { border-bottom: 1px solid #eee; padding: 15px 0; }
        .item:last-child { border-bottom: none; }
        .total { font-size: 18px; font-weight: bold; color: #333; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background: #333; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">ASCENSION</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        <!-- Order Details -->
        <div class="content">
          <h2>Order Details</h2>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <div class="order-details">
            <h3>Shipping Address</h3>
            <p>
              <strong>${data.shippingAddress.name}</strong><br>
              ${data.shippingAddress.line1}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}
            </p>
          </div>

          <h3>Order Items</h3>
          ${data.items.map(item => `
            <div class="item">
              <strong>${item.name}</strong><br>
              Quantity: ${item.quantity}<br>
              Price: ₹${item.price.toFixed(2)}<br>
              Total: ₹${item.total.toFixed(2)}
            </div>
          `).join('')}
          
          <div class="total">
            <strong>Total Amount: ₹${data.total.toFixed(2)}</strong>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Questions? Contact us at support@ascension.com</p>
          <p>© 2024 Ascension. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML for shipping update email
 */
function generateShippingUpdateHTML(data: ShippingUpdateData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shipping Update - Ascension</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e8f5e8; padding: 20px; text-align: center; border-radius: 8px; }
        .logo { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .tracking-info { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">ASCENSION</div>
          <h1>🚚 Your Order Has Shipped!</h1>
          <p>Good news! Your order is on its way to you.</p>
        </div>

        <!-- Tracking Information -->
        <div class="tracking-info">
          <h2>📦 Tracking Information</h2>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Carrier:</strong> ${data.carrier}</p>
          <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
          <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Track your package: <a href="#">Click here</a></p>
          <p>Questions? Contact us at support@ascension.com</p>
          <p>© 2024 Ascension. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Simulate email API call (replace with actual email service)
 */
async function simulateEmailAPI(emailTemplate: EmailTemplate): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, this would be:
  // const response = await fetch('https://your-email-service.com/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_API_KEY' },
  //   body: JSON.stringify(emailTemplate)
  // });
  
  console.log('📧 Email sent successfully to:', emailTemplate.to);
  return { success: true, message: 'Email sent successfully' };
}

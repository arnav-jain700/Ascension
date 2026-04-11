export interface InvoiceData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  total: number;
  orderDate: string;
  businessDetails: {
    name: string;
    email: string;
    phone: string;
    gstin: string;
    pan: string;
    address: string;
  };
}

/**
 * Generate PDF invoice for download
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  // This is a simplified version - in production you'd use libraries like jsPDF or Puppeteer
  const html = generateInvoiceHTML(data);
  
  // Create blob from HTML
  return new Blob([html], { type: 'text/html' });
}

/**
 * Generate HTML content for invoice
 */
function generateInvoiceHTML(data: InvoiceData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${data.orderNumber} - Ascension</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: #f5f5f5; 
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .business-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        .customer-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-section {
          flex: 1;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #333;
          font-weight: bold;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        .totals {
          text-align: right;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .grand-total {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          border-top: 2px solid #333;
          padding-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .gst-info {
          background: #f0f8ff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="logo">ASCENSION</div>
          <div class="business-info">
            <div>${data.businessDetails.name}</div>
            <div>${data.businessDetails.email} | ${data.businessDetails.phone}</div>
            <div>GSTIN: ${data.businessDetails.gstin}</div>
            <div>PAN: ${data.businessDetails.pan}</div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="customer-info">
          <div class="info-section">
            <div class="section-title">Bill To:</div>
            <div><strong>${data.customerName}</strong></div>
            <div>${data.customerEmail}</div>
            <div>${data.customerPhone}</div>
            <div class="section-title" style="margin-top: 15px;">Billing Address:</div>
            <div>
              ${data.billingAddress.line1}
              ${data.billingAddress.line2 ? '<br>' + data.billingAddress.line2 : ''}
              <br>${data.billingAddress.city}, ${data.billingAddress.state} ${data.billingAddress.postalCode}
              <br>${data.billingAddress.country}
            </div>
          </div>
          <div class="info-section" style="text-align: right;">
            <div class="section-title">Invoice Details:</div>
            <div><strong>Invoice Number:</strong> ${data.orderNumber}</div>
            <div><strong>Date:</strong> ${data.orderDate}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- GST Information -->
        <div class="gst-info">
          <div class="section-title">GST Breakdown</div>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>CGST:</strong> ₹${data.cgst.toFixed(2)} (9%)
            </div>
            <div>
              <strong>SGST:</strong> ₹${data.sgst.toFixed(2)} (9%)
            </div>
            <div>
              <strong>IGST:</strong> ₹${data.igst.toFixed(2)} (18%)
            </div>
          </div>
          <div style="margin-top: 10px;">
            <strong>Total GST:</strong> ₹${data.totalGST.toFixed(2)}
          </div>
        </div>

        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${data.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Total GST:</span>
            <span>₹${data.totalGST.toFixed(2)}</span>
          </div>
          <div class="grand-total">
            <span>Grand Total:</span>
            <span>₹${data.total.toFixed(2)}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>${data.businessDetails.address}</div>
          <div>This is a computer-generated invoice. No signature required.</div>
          <div>Thank you for your business!</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Download invoice as PDF file
 */
export function downloadInvoicePDF(data: InvoiceData, filename: string = `invoice-${data.orderNumber}.pdf`) {
  generateInvoicePDF(data).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

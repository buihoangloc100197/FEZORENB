/**
 * lib/email.ts
 * Email helper for ZORENB luxury watch store.
 * Uses Resend API (https://resend.com) if RESEND_API_KEY is configured,
 * otherwise logs the email to console (dev/mock mode).
 */

export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number; // VND
  image_url?: string;
}

export interface SendOrderConfirmationParams {
  to: string;
  customerName: string;
  orderCode: string | number;
  totalAmount: number; // VND
  items: OrderItem[];
  paymentMethod?: string;
  orderDate?: string;
}

/** Generate the luxury HTML invoice email body */
function buildInvoiceHtml(params: SendOrderConfirmationParams): string {
  const {
    customerName,
    orderCode,
    totalAmount,
    items,
    paymentMethod = "PayOS QR / Banking",
    orderDate = new Date().toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  } = params;

  const formatVND = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 8px; border-bottom:1px solid #2a2a35; color:#d4d4d8; font-size:13px;">
        ${item.product_name}
      </td>
      <td style="padding:10px 8px; border-bottom:1px solid #2a2a35; color:#d4d4d8; font-size:13px; text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:10px 8px; border-bottom:1px solid #2a2a35; color:#d4af37; font-size:13px; text-align:right; font-family:monospace;">
        ${formatVND(item.price)}
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xác Nhận Đơn Hàng FEZORENB #${orderCode}</title>
</head>
<body style="margin:0; padding:0; background:#0b0b0c; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0c; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#101015; border:1px solid #24242e; border-radius:16px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d0d10 0%,#1a1a24 100%); padding:40px 40px 32px; text-align:center; border-bottom:1px solid #24242e;">
              <div style="display:inline-block; background:#d4af37; color:#0b0b0c; font-size:10px; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; padding:6px 16px; border-radius:20px; margin-bottom:20px;">
                FEZORENB • HAUTE HORLOGERIE
              </div>
              <h1 style="margin:0; color:#f4f4f5; font-size:28px; font-weight:300; letter-spacing:0.05em; text-transform:uppercase; font-family:Georgia, serif;">
                Cảm Ơn Quý Khách
              </h1>
              <p style="margin:12px 0 0; color:#a1a1aa; font-size:14px; font-weight:300;">
                Đơn hàng của Quý khách đã được xác nhận và đang được xử lý
              </p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="padding:24px 40px; background:#0f3d20; border-bottom:1px solid #166534; text-align:center;">
              <span style="color:#4ade80; font-size:24px;">✓</span>
              <span style="color:#86efac; font-size:14px; font-weight:600; margin-left:8px; letter-spacing:0.05em;">
                THANH TOÁN THÀNH CÔNG
              </span>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px; color:#71717a; font-size:12px; text-transform:uppercase; letter-spacing:0.15em;">
                Kính gửi Quý khách,
              </p>
              <p style="margin:0 0 24px; color:#f4f4f5; font-size:15px; line-height:1.7;">
                Xin chào <strong style="color:#d4af37;">${customerName}</strong>,<br/>
                FEZORENB trân trọng cảm ơn Quý khách đã tin tưởng và lựa chọn những tuyệt phẩm đồng hồ haute horlogerie từ chúng tôi. Đơn hàng của Quý khách đang được đội ngũ chuyên gia xử lý và chuẩn bị giao hàng trong thời gian sớm nhất.
              </p>

              <!-- Order Meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#18181f; border:1px solid #2a2a35; border-radius:12px; margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px; border-bottom:1px solid #2a2a35;">
                    <span style="color:#71717a; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Mã Đơn Hàng</span>
                    <br/>
                    <span style="color:#f4f4f5; font-size:16px; font-weight:700; font-family:monospace; margin-top:4px; display:block;">#${orderCode}</span>
                  </td>
                  <td style="padding:16px 20px; border-bottom:1px solid #2a2a35;">
                    <span style="color:#71717a; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Ngày Đặt Hàng</span>
                    <br/>
                    <span style="color:#f4f4f5; font-size:14px; margin-top:4px; display:block;">${orderDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="color:#71717a; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Phương Thức Thanh Toán</span>
                    <br/>
                    <span style="color:#4ade80; font-size:14px; margin-top:4px; display:block;">${paymentMethod}</span>
                  </td>
                  <td style="padding:16px 20px;">
                    <span style="color:#71717a; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Trạng Thái</span>
                    <br/>
                    <span style="color:#4ade80; font-size:14px; font-weight:600; margin-top:4px; display:block;">✓ Đã Thanh Toán</span>
                  </td>
                </tr>
              </table>

              <!-- Items Table -->
              <h3 style="margin:0 0 12px; color:#a1a1aa; font-size:11px; text-transform:uppercase; letter-spacing:0.2em;">
                Chi Tiết Đơn Hàng
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#18181f; border:1px solid #2a2a35; border-radius:12px; overflow:hidden; margin-bottom:16px;">
                <thead>
                  <tr style="background:#0d0d10;">
                    <th style="padding:12px 8px; color:#71717a; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; text-align:left; font-weight:500;">Sản Phẩm</th>
                    <th style="padding:12px 8px; color:#71717a; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; text-align:center; font-weight:500;">SL</th>
                    <th style="padding:12px 8px; color:#71717a; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; text-align:right; font-weight:500;">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1200,#241b00); border:1px solid #d4af37; border-radius:12px; margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <span style="color:#a37d1d; font-size:12px; text-transform:uppercase; letter-spacing:0.15em;">Tổng Thanh Toán</span>
                    <br/>
                    <span style="color:#d4af37; font-size:24px; font-weight:700; font-family:monospace; margin-top:4px; display:block;">
                      ${formatVND(totalAmount)}
                    </span>
                    <span style="color:#71717a; font-size:11px; margin-top:4px; display:block;">Đã bao gồm phí vận chuyển bảo hiểm toàn cầu</span>
                  </td>
                </tr>
              </table>

              <!-- Services -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td width="33%" style="text-align:center; padding:16px 8px;">
                    <div style="color:#d4af37; font-size:20px; margin-bottom:6px;">🛡</div>
                    <div style="color:#a1a1aa; font-size:11px; line-height:1.5;">Thẻ Chứng Thực<br/>NFC Quốc Tế</div>
                  </td>
                  <td width="33%" style="text-align:center; padding:16px 8px;">
                    <div style="color:#d4af37; font-size:20px; margin-bottom:6px;">📦</div>
                    <div style="color:#a1a1aa; font-size:11px; line-height:1.5;">Giao Hàng<br/>Bọc Thép Bảo Hiểm</div>
                  </td>
                  <td width="33%" style="text-align:center; padding:16px 8px;">
                    <div style="color:#d4af37; font-size:20px; margin-bottom:6px;">🔧</div>
                    <div style="color:#a1a1aa; font-size:11px; line-height:1.5;">Bảo Hành<br/>5 Năm Quốc Tế</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d10; padding:24px 40px; border-top:1px solid #24242e; text-align:center;">
              <p style="margin:0 0 8px; color:#52525b; font-size:12px;">
                FEZORENB — Haute Horlogerie Boutique
              </p>
              <p style="margin:0; color:#3f3f46; font-size:11px;">
                Nếu Quý khách có thắc mắc, vui lòng liên hệ: <span style="color:#d4af37;">support@fezorenb.com</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Send order confirmation email */
export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams
): Promise<{ success: boolean; message: string; emailId?: string }> {
  const html = buildInvoiceHtml(params);
  const subject = `✨ FEZORENB — Xác Nhận Đơn Hàng #${params.orderCode}`;

  const resendApiKey = process.env.RESEND_API_KEY;

  // Use Resend if API key is configured
  if (resendApiKey && !resendApiKey.startsWith("re_placeholder")) {
    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL ||
        "FEZORENB <onboarding@resend.dev>";

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [params.to],
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          data.name === "validation_error" ||
          (data.message && data.message.includes("domain"))
        ) {
          console.warn(
            "Resend domain not verified. Set RESEND_FROM_EMAIL with your verified domain in resend.com/domains",
            data.message
          );
        }
        throw new Error(data.message || "Resend API error");
      }

      return {
        success: true,
        message: `Email xác nhận đã gửi thành công qua Resend đến ${params.to}`,
        emailId: data.id,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Resend email error:", msg);
      return {
        success: false,
        message: "Lỗi gửi email: " + msg,
      };
    }
  }

  // Mock mode: log to console for development
  console.log("=== [MOCK EMAIL] ===");
  console.log(`To: ${params.to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Order: #${params.orderCode} | Total: ${params.totalAmount} VND`);
  console.log("===================");

  return {
    success: true,
    message: `Email xác nhận (mock) đã ghi log cho ${params.to}. Cấu hình RESEND_API_KEY để gửi email thật.`,
  };
}

/** Build plain text version for logging */
export { buildInvoiceHtml };

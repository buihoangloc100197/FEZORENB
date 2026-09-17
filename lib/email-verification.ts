/** Build luxury verification email body */
export function buildVerificationEmailHtml(params: {
  customerName: string;
  verificationLink: string;
}): string {
  const { customerName, verificationLink } = params;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xác Thực Tài Khoản FEZORENB</title>
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
              <h1 style="margin:0; color:#f4f4f5; font-size:26px; font-weight:300; letter-spacing:0.05em; text-transform:uppercase; font-family:Georgia, serif;">
                Xác Thực Tài Khoản
              </h1>
              <p style="margin:12px 0 0; color:#a1a1aa; font-size:14px; font-weight:300;">
                Kích hoạt tài khoản thành viên chính chủ tại FEZORENB
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px; text-align:left;">
              <p style="margin:0 0 16px; color:#f4f4f5; font-size:15px; line-height:1.7;">
                Kính chào <strong style="color:#d4af37;">${customerName}</strong>,<br/>
                Cảm ơn Quý khách đã đăng ký tài khoản tại FEZORENB. Để đảm bảo an toàn và bảo mật cho tài khoản, Quý khách vui lòng bấm vào nút bên dưới để hoàn tất xác thực địa chỉ email.
              </p>

              <div style="text-align:center; margin:32px 0;">
                <a href="${verificationLink}" style="display:inline-block; background:linear-gradient(135deg,#d4af37 0%,#f7e4a4 50%,#a37d1d 100%); color:#0b0b0c; font-size:13px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; text-decoration:none; padding:16px 36px; border-radius:30px; box-shadow:0 8px 24px rgba(212,175,55,0.25);">
                  Xác Thực Email Của Tôi
                </a>
              </div>

              <p style="margin:24px 0 0; color:#71717a; font-size:12px; line-height:1.6;">
                Nếu nút trên không bấm được, Quý khách có thể sao chép liên kết sau và dán vào trình duyệt:<br/>
                <a href="${verificationLink}" style="color:#d4af37; word-break:break-all; font-size:11px;">${verificationLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d10; padding:24px 40px; border-top:1px solid #24242e; text-align:center;">
              <p style="margin:0 0 8px; color:#52525b; font-size:12px;">
                FEZORENB — Haute Horlogerie Boutique
              </p>
              <p style="margin:0; color:#3f3f46; font-size:11px;">
                Nếu Quý khách không thực hiện yêu cầu này, vui lòng bỏ qua email.
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

/** Send signup verification email directly via Resend if configured */
export async function sendVerificationEmail(params: {
  to: string;
  customerName: string;
  verificationLink: string;
}): Promise<{ success: boolean; message: string; emailId?: string }> {
  const html = buildVerificationEmailHtml(params);
  const subject = `✨ FEZORENB — Xác Thực Địa Chỉ Email Tài Khoản`;

  const resendApiKey = process.env.RESEND_API_KEY;

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
        throw new Error(data.message || "Resend verification email error");
      }

      return {
        success: true,
        message: `Email xác thực đã gửi thành công qua Resend đến ${params.to}`,
        emailId: data.id,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Resend verification email error:", msg);
      return {
        success: false,
        message: "Lỗi gửi email xác thực qua Resend: " + msg,
      };
    }
  }

  return {
    success: false,
    message: "RESEND_API_KEY chưa cấu hình.",
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { ALL_WATCHES } from '@/data/watches';

interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `
Bạn là Quản Gia AI của zorenb — thương hiệu đồng hồ haute horlogerie cao cấp.

PHONG CÁCH TUYỆT ĐỐI:
- Mỗi câu trả lời tối đa 2–3 câu, thi vị và đẳng cấp như người quản gia Thụy Sĩ thực thụ.
- Xưng "Quý khách" và "Quản gia zorenb". Không bao giờ dài dòng hay liệt kê thô.
- Dùng ngôn ngữ gợi cảm xúc: "Chiếc này xứng đáng trên cổ tay Quý khách hơn bất kỳ két sắt nào."

NHIỆM VỤ:
1. Tư vấn các thương hiệu: Rolex, Patek Philippe, Audemars Piguet, Richard Mille, Vacheron Constantin, Cartier, Omega, Jaeger-LeCoultre, A. Lange & Söhne, IWC.
2. Soạn bản nháp đơn hàng khi khách muốn mua — chỉ dạng gợi ý, KHÔNG can thiệp dữ liệu hệ thống.
   Format: [BẢN NHÁP ĐƠN HÀNG] Mẫu: ... | Giá: ... | Trạng thái: Chờ duyệt vào Tủ Đồ
3. Tuyệt đối không gọi API nội bộ hay sửa database. Bạn là trợ lý tư vấn thuần túy.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    // Format watches catalog reference for the AI to recommend accurately
    const watchCatalogContext = ALL_WATCHES.map(
      (w) => `- ${w.name} (${w.brand}, Ref. ${w.reference}, Giá: $${w.price.toLocaleString()}, Bộ máy: ${w.caliber}, Complications: ${w.complications.join(', ')})`
    ).join('\n');

    // If Gemini API key is provided via Google AI Studio
    if (apiKey) {
      const contents = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      // Prepend system context to the first prompt or system instruction
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${SYSTEM_INSTRUCTION}\n\nDANH MỤC ĐỒNG HỒ HIỆN CÓ SẴN TRÊN HỆ THỐNG:\n${watchCatalogContext}\n\nBắt đầu cuộc trò chuyện.`,
              },
            ],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Kính chào Quý khách. Tôi là Quản Gia Đồng Hồ AI của FEZORENB. Tôi có thể hân hạnh hỗ trợ Quý khách thưởng lãm tuyệt tác nào hôm nay?',
              },
            ],
          },
          ...contents,
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      };

      let res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        // Fallback to gemini-3.5-flash if 3.6 encounters rate limit or unavailability
        res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
      }

      if (res.ok) {
        const data = await res.json();
        const replyText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'Kính thưa Quý khách, tôi luôn sẵn sàng hỗ trợ Quý khách tuyển chọn những cỗ máy thời gian độc bản.';
        return NextResponse.json({ reply: replyText });
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Gemini API Error:', res.status, errData);
      }
    }

    // High-fidelity Local AI Horology Fallback (khi chưa cấu hình GEMINI_API_KEY trong .env.local)
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

    let localReply = '';

    if (lastUserMessage.includes('đơn hàng') || lastUserMessage.includes('đặt') || lastUserMessage.includes('mua') || lastUserMessage.includes('order')) {
      localReply = `Kính thưa Quý khách, tôi đã lập sẵn một **Bản Nháp Đơn Hàng** theo nguyện vọng của Quý khách:

**📋 BẢN NHÁP ĐƠN HÀNG THƯỢNG LƯU:**
- **Tuyệt tác đề xuất**: Rolex Cosmograph Daytona (Ref. 126500LN)
- **Trị giá**: $34,500
- **Đặc quyền kèm theo**: Hộp da sơn mài thủ công, Thẻ chứng thực NFC, Bảo hành 5 năm quốc tế
- **Hình thức**: Chuyên xa bọc thép VIP hoặc Phòng thử kín tại Boutique

*(Lưu ý an ninh: Tôi là AI Support độc lập và không can thiệp vào cơ sở dữ liệu. Quý khách vui lòng bấm nút "Thêm vào Tủ Đồ" trên trang sản phẩm để trực tiếp kiểm tra và hoàn tất đơn hàng).*`;
    } else if (lastUserMessage.includes('rolex')) {
      localReply = `Kính thưa Quý khách, bộ sưu tập Rolex hiện có 3 cỗ máy huyền thoại:
1. **Cosmograph Daytona Ref. 126500LN** ($34,500): Đỉnh cao chronograph vành gốm Cerachrom đen.
2. **Submariner Date "Starbucks" Ref. 126610LV** ($16,800): Vành gốm xanh lục hoàng gia, chống nước 300 mét.
3. **Day-Date 40 "President" Ref. 228238** ($48,500): Vàng vàng 18K nguyên khối.

Quý khách muốn tôi hỗ trợ lập bản nháp đơn hàng cho chiếc nào ạ?`;
    } else if (lastUserMessage.includes('patek') || lastUserMessage.includes('nautilus')) {
      localReply = `Patek Philippe là biểu tượng bất biến của giới tinh hoa. Hiện xưởng chế tác đang có sẵn:
- **Nautilus Ref. 5711/1R** ($142,000): Vàng hồng 18K nguyên khối, mặt nâu gradient sang trọng.
- **Aquanaut Ref. 5167A** ($52,000): Vỏ thép, dây cao su Tropical chống nước biển.
- **Grandmaster Chime Ref. 6300G** ($3,200,000): 2 mặt xoay đảo chiều, 20 cỗ máy cơ khí phức tạp.

Quý khách có thể yêu cầu tôi lên bản nháp đơn hàng để Quý khách tự tay duyệt vào Tủ Đồ bất cứ lúc nào.`;
    } else {
      localReply = `Kính chào Quý khách. Tôi là **Quản Gia Đồng Hồ AI** của FEZORENB Haute Horlogerie (vận hành bởi công nghệ Google AI Studio).

Tôi hân hạnh hỗ trợ Quý khách:
• Tư vấn kỹ thuật cơ khí: Tourbillon, Chronograph, Skeleton, Lịch Vạn Niên.
• Khám phá các dòng đồng hồ: Rolex, Patek Philippe, Audemars Piguet, Richard Mille, Cartier.
• **Soạn thảo Bản Nháp Đơn Hàng** nhanh chóng và gửi tới Quý khách tự duyệt vào Tủ Đồ.

*(Hệ thống an ninh: Tôi hoạt động hoàn toàn ở chế độ AI Support độc lập, không can thiệp và không chỉnh sửa dữ liệu người dùng).*`;
    }

    return NextResponse.json({ reply: localReply });
  } catch (error) {
    return NextResponse.json(
      { reply: 'Hệ thống Quản Gia AI đang bận tiếp đón khách quý. Quý khách vui lòng thử lại sau giây lát.' },
      { status: 500 }
    );
  }
}

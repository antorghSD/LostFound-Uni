interface MatchFoundData {
  userName: string;
  yourItemTitle: string;
  yourItemType: 'LOST' | 'FOUND';
  matchItemTitle: string;
  matchItemDescription: string;
  matchCategoryName: string;
  matchLocation?: string;
  matchScore: number;
  matchItemId: string;
  appUrl: string;
}

export const matchFoundTemplate = (data: MatchFoundData) => {
  const confidence = Math.round(data.matchScore * 100);
  const itemUrl = `${data.appUrl}/item/${data.matchItemId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Possible Match Found</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#F26522 0%,#D9541A 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:#ffffff;color:#F26522;font-weight:800;font-size:18px;padding:8px 16px;border-radius:10px;letter-spacing:1px;">UIU</div>
              <h1 style="color:#ffffff;font-size:24px;margin:16px 0 0 0;font-weight:700;">🎉 Possible Match Found!</h1>
              <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:8px 0 0 0;">UIU Lost &amp; Found</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="font-size:16px;color:#1A2332;margin:0 0 16px 0;">Hi <strong>${data.userName}</strong>,</p>
              <p style="font-size:14px;color:#4a5568;line-height:1.6;margin:0 0 24px 0;">
                Good news! Our matching engine found a potential match for your <strong>${data.yourItemType.toLowerCase()}</strong> item "<strong>${data.yourItemTitle}</strong>".
              </p>
              <div style="background:#FFF5EE;border-left:4px solid #F26522;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
                <p style="font-size:12px;color:#F26522;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Match Confidence</p>
                <p style="font-size:28px;color:#F26522;font-weight:800;margin:0;">${confidence}%</p>
              </div>
              <div style="border:1px solid #e5e4e7;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px 0;">Matched Item</p>
                <h3 style="font-size:18px;color:#1A2332;margin:0 0 8px 0;font-weight:700;">${data.matchItemTitle}</h3>
                <p style="font-size:14px;color:#4a5568;line-height:1.6;margin:0 0 12px 0;">
                  ${data.matchItemDescription.substring(0, 150)}${data.matchItemDescription.length > 150 ? '...' : ''}
                </p>
                <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#6b7280;">
                  <tr><td style="padding:2px 0;"><strong style="color:#1A2332;">Category:</strong> ${data.matchCategoryName}</td></tr>
                  ${data.matchLocation ? `<tr><td style="padding:2px 0;"><strong style="color:#1A2332;">Location:</strong> ${data.matchLocation}</td></tr>` : ''}
                </table>
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px 0;">
                    <a href="${itemUrl}" style="display:inline-block;background:#F26522;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;">
                      View &amp; Claim This Item →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;text-align:center;">
                If this is not your item, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e4e7;">
              <p style="font-size:12px;color:#9ca3af;margin:0 0 8px 0;">United International University — Lost &amp; Found</p>
              <p style="font-size:11px;color:#c1c5cc;margin:0;">© ${new Date().getFullYear()} UIU Lost &amp; Found. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `Hi ${data.userName},

Good news! We found a possible match for your ${data.yourItemType.toLowerCase()} item "${data.yourItemTitle}".

Match Confidence: ${confidence}%

Matched Item: ${data.matchItemTitle}
Category: ${data.matchCategoryName}

View and claim: ${itemUrl}

— UIU Lost & Found`;

  return { html, text };
};
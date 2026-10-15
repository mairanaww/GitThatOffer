export function Header({ subtitle }) {
    return `
      <div style="padding:32px 0 16px;text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#1f2937;">GitThatOffer</div>
        ${subtitle ? `<div style="color:#6b7280;font-size:16px;">${subtitle}</div>` : ''}
      </div>
    `
  }
  
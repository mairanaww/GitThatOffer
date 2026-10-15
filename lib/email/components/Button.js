export function Button({ href, label, color = '#1f2937' }) {
    return `
      <a href="${href}" 
        style="
          display:inline-block;
          padding:12px 24px;
          background:${color};
          color:#fff;
          text-decoration:none;
          border-radius:6px;
          font-weight:500;
          margin:24px 0;
          font-size:16px;"
      >${label}</a>
    `
  }
  
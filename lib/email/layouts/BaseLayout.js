import { Header } from '../components/Header.js'
import { Footer } from '../components/Footer.js'

export function BaseLayout({ children, subtitle }) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f6f8fa;">
      <div style="max-width:600px;margin:0 auto;background:#fff;font-family:Arial,sans-serif;font-size:16px;line-height:1.5;">
        ${Header({ subtitle })}
        <div style="padding:0 24px;">
          ${children}
        </div>
        ${Footer()}
      </div>
    </body>
    </html>
  `
}

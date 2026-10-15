import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'GitThatOffer - MIT Internship',
  description: 'Streamlined MIT internship portal for students and administrators',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-[#111020]">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}


// Add to app/layout.js or create app/startup.js
import { emailScheduler } from '../lib/emailScheduler'

// Start email scheduler in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  emailScheduler.start()
}

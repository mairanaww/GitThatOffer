#  GitThatOffer - Intelligent Job Portal Platform

<div align="center">

![GitThatOffer Logo](https://img.shields.io/badge/GitThatOffer-Job%20Portal-blue?style=for-the-badge&logo=briefcase)

**An AI-powered job portal platform designed to streamline campus placements and job applications**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com/)

[🌐 Live Demo](https://git-thatoffer.vercel.app) | [📋 Features](#-features) | [🚀 Quick Start](#-quick-start)

</div>

---

##  Overview

GitThatOffer is a comprehensive job portal platform that revolutionizes how students and companies interact during campus placements. Built with modern web technologies, it provides an intelligent, automated solution for managing job applications, company requirements, and student eligibility.

###  Why GitThatOffer?

- ** AI-Powered**: Automated PDF parsing using Google Gemini AI
- ** Real-time Updates**: Live company additions and status tracking
- ** Smart Notifications**: Automated email reminders and alerts
- ** Modern UI**: Beautiful, responsive design with Tailwind CSS
- ** Secure Authentication**: Google OAuth integration with MongoDB
- ** Lightning Fast**: Next.js 14 with App Router for optimal performance

---

##  Features

###  For Students
- ** Personal Dashboard**: Track all applications, deadlines, and progress
- ** Smart Matching**: Get personalized company recommendations based on CGPA, branch, and preferences
- ** Never Miss Deadlines**: Automated email reminders 24 hours and 4 hours before deadlines
- ** Application Tracking**: Mark companies as interested, applied, or not interested
- ** Eligibility Checker**: Instant feedback on company eligibility based on your profile
- ** Profile Management**: Complete profile setup with branch, CGPA, and backlogs

###  For Administrators
- ** AI-Powered PDF Parsing**: Upload PDFs and extract company details automatically using Google Gemini
- ** Manual Entry**: Add companies manually with comprehensive details
- ** Easy Editing**: Modify company information on-the-fly
- ** Analytics Dashboard**: View application statistics and user engagement
- ** Email Management**: Send alerts to eligible students when new companies are added
- ** Company Management**: Delete or update company listings

###  System Features
- ** Google OAuth Authentication**: Secure sign-in with Google accounts
- ** Email Automation**: Nodemailer integration for automated communications
- ** Cron Jobs**: Scheduled email reminders using Vercel Cron
- ** Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ** Modern UI**: Dark theme with beautiful gradients and animations
- ** Performance Optimized**: Fast loading with Next.js optimization

---

##  Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript/React 18
- **Styling**: Tailwind CSS
- **Icons**: Heroicons, React Icons
- **UI Components**: Custom components with animations

### Backend
- **API Routes**: Next.js API Routes
- **Authentication**: NextAuth.js with Google Provider
- **Database**: MongoDB Atlas with Mongoose
- **File Upload**: Multer for PDF handling
- **PDF Processing**: pdf-parse for text extraction

### AI & External Services
- **AI**: Google Gemini API for intelligent PDF parsing
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Vercel with automatic deployments
- **Cron Jobs**: Vercel Cron for scheduled tasks

---

##  Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Google Cloud Console project
- Gmail account for SMTP

### 1. Clone the Repository
```bash
git clone https://github.com/Pranav-Kumar14/GitThatOffer.git
cd GitThatOffer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
MONGODB_URI=your-mongodb-connection-string

# AI Service
GEMINI_API_KEY=your-gemini-api-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin Configuration
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Cron Jobs
CRON_SECRET=your-cron-secret
```

### 4. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

---

##  Project Structure

```
GitThatOffer/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth configuration
│   │   ├── companies/         # Company management APIs
│   │   ├── user/              # User management APIs
│   │   ├── admin/             # Admin-only APIs
│   │   ├── email/             # Email testing APIs
│   │   └── cron/              # Scheduled job endpoints
│   ├── components/            # Reusable React components
│   ├── dashboard/            # Student dashboard
│   ├── admin/                # Admin panel
│   ├── setup/                # User profile setup
│   └── auth/                 # Authentication pages
├── lib/
│   ├── auth.js               # NextAuth configuration
│   ├── mongodb.js            # Database connection & utilities
│   ├── sendMail.js           # Email service
│   ├── emailScheduler.js     # Cron job logic
│   └── email/                # Email templates
├── public/                   # Static assets
└── styles/                   # Global styles
```

---

##  API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Companies
- `GET /api/companies` - Get eligible companies for user
- `GET /api/admin/companies` - Get all companies (admin)
- `POST /api/admin/companies` - Create new company (admin)
- `PUT /api/admin/companies/[id]` - Update company (admin)
- `DELETE /api/admin/companies/[id]` - Delete company (admin)

### User Management
- `GET /api/user/profile` - Get user profile
- `POST /api/user/setup` - Complete user profile setup
- `POST /api/user/company-status` - Update application status

### AI & Automation
- `POST /api/admin/extract` - Extract data from PDF using AI
- `GET /api/cron/email-scheduler` - Automated email reminders
- `GET /api/email/test` - Test email configuration

---

##  Email Templates

The platform includes beautiful, responsive email templates:

- **Welcome Email**: Sent when users complete their profile
- **New Company Alert**: Notifies students of new opportunities
- **24-Hour Reminder**: Application deadline reminder
- **4-Hour Reminder**: Final deadline warning

All emails are built with:
- Responsive design for all devices
- Professional branding
- Clear call-to-action buttons
- Personalized content

---

##  Security Features

- **OAuth 2.0**: Secure Google authentication
- **Session Management**: Secure session handling with NextAuth
- **Environment Variables**: Sensitive data protection
- **API Protection**: Admin-only routes protection
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Proper cross-origin settings

---

##  Deployment

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel

2. **Environment Variables**: Add all environment variables in Vercel dashboard

3. **Build Settings**: Vercel automatically detects Next.js configuration

4. **Custom Domain**: Configure your custom domain if needed

5. **Cron Jobs**: Automatically configured via `vercel.json`

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

##  Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

##  Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Core Web Vitals**: All metrics in green

---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for seamless deployment platform
- **Google** for Gemini AI and OAuth services
- **MongoDB** for reliable database solutions
- **Tailwind CSS** for beautiful styling system

---

##  Support

Need help? We're here for you!

- ** Email**: team.gitthatoffer@gmail.com
- ** Issues**: [GitHub Issues](https://github.com/Pranav-Kumar14/GitThatOffer/issues)
- ** Discussions**: [GitHub Discussions](https://github.com/Pranav-Kumar14/GitThatOffer/discussions)

---

<div align="center">

** Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/Pranav-Kumar14/GitThatOffer?style=social)](https://github.com/Pranav-Kumar14/GitThatOffer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Pranav-Kumar14/GitThatOffer?style=social)](https://github.com/Pranav-Kumar14/GitThatOffer/network/members)

</div>

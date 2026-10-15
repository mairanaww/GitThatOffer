import { BaseLayout } from '../layouts/BaseLayout.js'
import { Button } from '../components/Button.js'

export function Welcome({ userName, appUrl }) {
  return {
    subject: `Welcome to GitThatOffer, ${userName}`,
    html: BaseLayout({
      subtitle: 'Your career platform',
      children: `
        <h2 style="color:#1f2937;text-align:center;margin-top:0;">Welcome, ${userName}</h2>
        <p style="color:#6b7280;">Your account has been successfully created. GitThatOffer connects you with internship and job opportunities that match your profile and career goals.</p>
        <ul style="margin:32px 0;padding:0 0 0 20px;">
          <li><b>Browse Opportunities:</b> View internships and jobs from verified companies</li>
          <li><b>Smart Matching:</b> Get recommendations based on your skills and preferences</li>
          <li><b>Deadline Tracking:</b> Never miss an application deadline with email reminders</li>
          <li><b>Application Management:</b> Track your application status in one place</li>
        </ul>
        <div style="text-align:center;">
          ${Button({ href: appUrl + '/dashboard', label: 'Go to Dashboard' })}
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin:32px 0;">
          <div style="font-size:18px;font-weight:600;color:#1f2937;margin:0 0 16px;">What's Next?</div>
          <div style="font-size:14px;color:#64748b;line-height:1.5;">
            Start exploring opportunities on your dashboard. When you find something interesting, mark it to receive deadline reminders and updates.
          </div>
        </div>
      `
    }),
    text: `Welcome to GitThatOffer!\n\nHi ${userName},\n\nYour account has been successfully created. GitThatOffer connects you with internship and job opportunities that match your profile.\n\nVisit your dashboard: ${appUrl}/dashboard\n\nBest regards,\nGitThatOffer Team`
  }
}

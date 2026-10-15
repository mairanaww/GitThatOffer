import { BaseLayout } from '../layouts/BaseLayout.js'
import { Button } from '../components/Button.js'

export function ReminderFourHoursBefore({ companyName, role, deadline, appUrl }) {
  return {
    subject: `URGENT: ${companyName} deadline in 4 hours`,
    html: BaseLayout({
      subtitle: 'Urgent Deadline Alert',
      children: `
        <h2 style="color:#dc2626;text-align:center;margin-top:0;">Application Deadline in 4 Hours</h2>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:24px 0;text-align:center;">
          <span style="font-size:18px;font-weight:600;color:#dc2626;">Time is running out!</span>
        </div>
        <div style="background:#dc2626;color:#fff;padding:16px;border-radius:6px;text-align:center;font-size:20px;font-weight:600;margin:24px 0;">
          4 HOURS REMAINING
        </div>
        <div style="margin:24px 0;padding:16px;border-left:4px solid #dc2626;background:#fff8f1;border-radius:8px;">
          <div><b>Company:</b> ${companyName}</div>
          <div><b>Position:</b> ${role}</div>
          <div><b>Deadline:</b> ${new Date(deadline.date + ' ' + deadline.time).toLocaleString()}</div>
          ${deadline.description ? `<div><b>Details:</b> ${deadline.description}</div>` : ''}
        </div>
        <div style="text-align:center;">
          ${Button({ href: appUrl + '/dashboard', label: 'Apply Now', color: '#dc2626' })}
        </div>
        <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:6px;padding:16px;margin:24px 0;font-size:14px;color:#92400e;text-align:center;">
          This is your final reminder. Make sure to submit your application before the deadline.
        </div>
      `
    }),
    text: `URGENT DEADLINE ALERT - GitThatOffer\n\nThe application deadline for ${companyName} - ${role} is in 4 hours (${new Date(deadline.date + ' ' + deadline.time).toLocaleString()}).\nApply now: ${appUrl}/dashboard\n\nBest regards,\nGitThatOffer Team`
  }
}

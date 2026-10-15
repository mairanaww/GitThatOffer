import { BaseLayout } from '../layouts/BaseLayout.js'
import { Button } from '../components/Button.js'

export function ReminderOneDayBefore({ companyName, role, deadline, appUrl }) {
  return {
    subject: `Deadline Tomorrow: ${companyName} - ${role}`,
    html: BaseLayout({
      subtitle: 'Deadline Reminder',
      children: `
        <h2 style="color:#1f2937;text-align:center;margin-top:0;">Application Deadline Tomorrow</h2>
        <div style="margin:24px 0;padding:16px;border-left:4px solid #f59e0b;background:#fff8f1;border-radius:8px;">
          <div><b>Company:</b> ${companyName}</div>
          <div><b>Position:</b> ${role}</div>
          <div><b>Deadline:</b> ${new Date(deadline.date + ' ' + deadline.time).toLocaleString()}</div>
          ${deadline.description ? `<div><b>Details:</b> ${deadline.description}</div>` : ''}
        </div>
        <div style="text-align:center;">
          ${Button({ href: appUrl + '/dashboard', label: 'View Dashboard' })}
        </div>
        <div style="margin:24px 0;padding:16px;background:#f8fafc;border-radius:6px;color:#64748b;font-size:14px;">
          Make sure to submit your application before the deadline to be considered for this opportunity.
        </div>
      `
    }),
    text: `Deadline Reminder - GitThatOffer\n\nThe application deadline for ${companyName} - ${role} is tomorrow (${new Date(deadline.date + ' ' + deadline.time).toLocaleString()}).\nVisit your dashboard: ${appUrl}/dashboard\n\nBest regards,\nGitThatOffer Team`
  }
}

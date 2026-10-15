import { BaseLayout } from '../layouts/BaseLayout.js'
import { Button } from '../components/Button.js'

export function NewCompanyAlert({ userName, company, userBranch, userCGPA, userBacklogs = 0, appUrl }) {
  return {
    subject: `New Opportunity: ${company.name} - ${company.role}`,
    html: BaseLayout({
      subtitle: 'New Opportunity Available',
      children: `
        <h2 style="color:#1f2937;text-align:center;margin-top:0;">A position matching your profile has been posted</h2>
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin:24px 0;background:#f8fafc;">
          <div style="font-size:20px;font-weight:600;color:#1f2937;">${company.name}</div>
          <div style="font-size:16px;color:#6b7280;margin-bottom:16px;">${company.role}</div>
          <div><b>Location:</b> ${company.location}</div>
          ${company.duration ? `<div><b>Duration:</b> ${company.duration}</div>` : ''}
          ${company.pay ? `<div><b>Compensation:</b> ${company.pay}</div>` : ''}
          <div><b>Backlogs Allowed:</b> ${company.backlogsAllowed !== null && company.backlogsAllowed !== undefined ? `Max ${company.backlogsAllowed}` : 'Not Specified'}</div>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:24px 0;">
          <div style="font-size:16px;font-weight:600;color:#166534;">You're Eligible</div>
          <div style="font-size:14px;color:#15803d;margin-bottom:8px;">This opportunity matches your profile:</div>
          <div style="font-size:14px;color:#15803d;">
            <div><b>Your Profile:</b> ${userBranch}, CGPA: ${userCGPA}, Backlogs: ${userBacklogs}</div>
            <div><b>Requirements:</b> ${company.cgpaCriteria ? `CGPA ${company.cgpaCriteria}+` : 'No CGPA requirement'}, ${company.backlogsAllowed !== null && company.backlogsAllowed !== undefined ? `Max ${company.backlogsAllowed} backlogs` : 'No backlog limit'}</div>
          </div>
        </div>
        ${company.deadlines && company.deadlines.length > 0 ? `
          <div style="margin:24px 0;">
            <div style="font-size:16px;font-weight:600;color:#374151;margin:0 0 12px;">Important Deadlines</div>
            ${company.deadlines.map(deadline => `
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:12px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:500;color:#9a3412;">${deadline.type}</span>
                <span style="color:#c2410c;font-size:14px;">${deadline.date} at ${deadline.time}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${company.applyLinks && company.applyLinks.length > 0 ? `
          <div style="margin:24px 0;">
            <div style="font-size:16px;font-weight:600;color:#374151;margin:0 0 12px;">Application Links</div>
            ${company.applyLinks.map(link => `
              <a href="${link.url}" style="display:inline-block;padding:10px 16px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;margin:4px 8px 4px 0;font-size:14px;">${link.title}</a>
            `).join('')}
          </div>
        ` : ''}
        <div style="text-align:center;">
          ${Button({ href: appUrl + '/dashboard', label: 'View Details' })}
        </div>
      `
    }),
    text: `New Opportunity - GitThatOffer\n\n${company.name} is hiring for ${company.role}.\n\nLocation: ${company.location}\n${company.duration ? `Duration: ${company.duration}\n` : ''}${company.pay ? `Pay: ${company.pay}\n` : ''}Backlogs Allowed: ${company.backlogsAllowed !== null && company.backlogsAllowed !== undefined ? `Max ${company.backlogsAllowed}` : 'Not Specified'}\n\nYour Profile: ${userBranch}, CGPA: ${userCGPA}, Backlogs: ${userBacklogs}\n\nView details: ${appUrl}/dashboard\n\nBest regards,\nGitThatOffer Team`
  }
}

import nodemailer from "nodemailer";
import {
  ReminderOneDayBefore,
  ReminderFourHoursBefore,
  Welcome,
  NewCompanyAlert,
} from "./email/index.js";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"GitThatOffer" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendReminderEmail(
  userEmail,
  companyName,
  role,
  deadline,
  reminderType
) {
  const appUrl = process.env.NEXTAUTH_URL;
  const template =
    reminderType === "1day"
      ? ReminderOneDayBefore({ companyName, role, deadline, appUrl })
      : ReminderFourHoursBefore({ companyName, role, deadline, appUrl });

  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendWelcomeEmail(userEmail, userName) {
  const appUrl = process.env.NEXTAUTH_URL;
  const template = Welcome({ userName, appUrl });

  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

// UPDATED TO INCLUDE USER BACKLOGS PARAMETER
export async function sendNewCompanyAlert(
  userEmail,
  userName,
  company,
  userBranch,
  userCGPA,
  userBacklogs = 0  // ADDED BACKLOGS PARAMETER WITH DEFAULT VALUE
) {
  const appUrl = process.env.NEXTAUTH_URL;
  const template = NewCompanyAlert({
    userName,
    company,
    userBranch,
    userCGPA,
    userBacklogs,  // ADDED BACKLOGS TO TEMPLATE
    appUrl,
  });

  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function testEmailConnection() {
  try {
    await transporter.verify();
    return { success: true, message: "Email service connected successfully" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

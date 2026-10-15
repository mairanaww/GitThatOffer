import cron from "node-cron";
import { connectToDatabase, findUser } from "./mongodb";
import { sendReminderEmail } from "./sendMail";

// Email scheduler service for handling automated reminders
class EmailScheduler {
  constructor() {
    this.isRunning = false;
  }

  // Start the email scheduler (runs every hour)
  start() {
    if (this.isRunning) return;

    console.log("📅 Starting email scheduler...");
    this.isRunning = true;

    // Run every hour at minute 0
    cron.schedule("30 0 * * *", async () => {
      await this.processScheduledEmails();
    });

    // Also run immediately on startup for testing
    setTimeout(() => this.processScheduledEmails(), 5000);
  }

  async processScheduledEmails() {
    try {
      const { db } = await connectToDatabase();
      const now = new Date();

      // Find emails that should be sent now
      const emailsToSend = await db
        .collection("emailReminders")
        .find({
          scheduledFor: { $lte: now },
          sent: false,
          retryCount: { $lt: 3 }, // Max 3 retry attempts
        })
        .toArray();

      console.log(`📧 Found ${emailsToSend.length} emails to send`);

      for (const emailReminder of emailsToSend) {
        try {
          // Check if user is still interested/applied (for deadline reminders)
          const user = await findUser(emailReminder.userEmail);
          if (!user) {
            console.log(
              `User ${emailReminder.userEmail} not found, skipping reminder`
            );
            continue;
          }

          // Check user's status for this company
          const userStatus =
            user.companyStatuses?.[emailReminder.companyId]?.status;
          if (
            !userStatus ||
            (userStatus !== "interested" && userStatus !== "applied")
          ) {
            console.log(
              `User ${emailReminder.userEmail} not interested in ${emailReminder.companyName}, skipping reminder`
            );

            // Mark as sent so we don't keep trying
            await db.collection("emailReminders").updateOne(
              { _id: emailReminder._id },
              {
                $set: {
                  sent: true,
                  sentAt: new Date(),
                  skipReason: "User not interested",
                },
              }
            );
            continue;
          }

          // 🟢 UPDATED: Pass parameters as an object!
          const result = await sendReminderEmail({
            userEmail: emailReminder.userEmail,
            companyName: emailReminder.companyName,
            role: emailReminder.role,
            deadline: emailReminder.deadline,
            reminderType: emailReminder.reminderType,
          });

          if (result.success) {
            // Mark as sent
            await db.collection("emailReminders").updateOne(
              { _id: emailReminder._id },
              {
                $set: {
                  sent: true,
                  sentAt: new Date(),
                  messageId: result.messageId,
                },
              }
            );
            console.log(
              `✅ Email sent successfully to ${emailReminder.userEmail} for ${emailReminder.companyName}`
            );
          } else {
            console.error(
              `❌ Failed to send email to ${emailReminder.userEmail}:`,
              result.error
            );

            // Mark as failed and increment retry count
            await db.collection("emailReminders").updateOne(
              { _id: emailReminder._id },
              {
                $inc: { retryCount: 1 },
                $set: { lastError: result.error },
              }
            );
          }
        } catch (error) {
          console.error(
            `❌ Error processing email for ${emailReminder.userEmail}:`,
            error
          );
        }

        // Small delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Clean up old sent emails (older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const cleanup = await db.collection("emailReminders").deleteMany({
        sent: true,
        sentAt: { $lt: thirtyDaysAgo },
      });

      if (cleanup.deletedCount > 0) {
        console.log(
          `🧹 Cleaned up ${cleanup.deletedCount} old email reminders`
        );
      }
    } catch (error) {
      console.error("❌ Error in email scheduler:", error);
    }
  }

  stop() {
    this.isRunning = false;
    console.log("📅 Email scheduler stopped");
  }
}

// Export singleton instance
export const emailScheduler = new EmailScheduler();

// Auto-start in production
if (process.env.NODE_ENV === "production") {
  emailScheduler.start();
}

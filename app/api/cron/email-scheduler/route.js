// app/api/cron/email-scheduler/route.js
import { emailScheduler } from '../../../../lib/emailScheduler'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Vercel cron job endpoint for email scheduling
export async function GET(request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Cron job triggered: Processing scheduled emails')
    await emailScheduler.processScheduledEmails()
    
    return Response.json({ 
      success: true, 
      message: 'Email processing completed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}

// Health check endpoint
export async function POST(request) {
  try {
    return Response.json({ 
      status: 'healthy',
      scheduler: emailScheduler.isRunning ? 'running' : 'stopped',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({ 
      status: 'error',
      error: error.message 
    }, { status: 500 })
  }
}

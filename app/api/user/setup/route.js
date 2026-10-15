import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { updateUser, findUser } from '../../../../lib/mongodb'
import { sendWelcomeEmail } from '../../../../lib/sendMail'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { branch, cgpa, backlogs } = await request.json()
    
    if (!branch || cgpa === undefined || backlogs === undefined) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }
    
    // Update user profile
    const result = await updateUser(session.user.email, {
      branch,
      cgpa: parseFloat(cgpa),
      backlogs: parseInt(backlogs)
    })
    
    if (result.matchedCount === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(session.user.email, session.user.name)
      console.log(`✅ Welcome email sent to ${session.user.email}`)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the setup if email fails
    }
    
    return Response.json({ message: 'Profile updated successfully' })
    
  } catch (error) {
    console.error('Setup error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

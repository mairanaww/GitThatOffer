import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'  // ← FIXED: 4 levels up
import { updateUser, findUser } from '../../../../lib/mongodb'  // ← FIXED: 4 levels up
import { sendWelcomeEmail } from '../../../../lib/sendMail'  // ← FIXED: 4 levels up

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await findUser(session.user.email)
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }
    
    return Response.json({
      email: user.email,
      name: user.name,
      image: user.image,
      branch: user.branch,
      cgpa: user.cgpa,
      backlogs: user.backlogs
    })
    
  } catch (error) {
    console.error('Profile fetch error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    
    // Check if this is the first time completing profile
    const existingUser = await findUser(session.user.email)
    const isFirstTimeSetup = !existingUser.branch || !existingUser.cgpa || existingUser.backlogs === undefined
    
    // Update user profile
    const result = await updateUser(session.user.email, {
      branch,
      cgpa: parseFloat(cgpa),
      backlogs: parseInt(backlogs)
    })
    
    if (result.matchedCount === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Send welcome email only for first-time setup
    if (isFirstTimeSetup) {
      try {
        const emailResult = await sendWelcomeEmail(session.user.email, session.user.name)
        if (emailResult.success) {
          console.log(`✅ Welcome email sent to ${session.user.email}`)
        } else {
          console.error(`❌ Failed to send welcome email to ${session.user.email}:`, emailResult.error)
        }
      } catch (emailError) {
        console.error('Welcome email error:', emailError)
        // Don't fail the setup if email fails
      }
    }
    
    return Response.json({ message: 'Profile updated successfully' })
    
  } catch (error) {
    console.error('Profile update error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

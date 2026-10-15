import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, isAdmin } from '../../../../lib/auth'
import { testEmailConnection } from '../../../../lib/sendMail'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await testEmailConnection()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to test email connection' 
    }, { status: 500 })
  }
}

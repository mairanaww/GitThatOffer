import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, isAdmin } from '../../../../lib/auth'
import { createCompany, getActiveCompanies, scheduleEmailReminders, sendNewCompanyAlertsToUsers } from '../../../../lib/mongodb'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companies = await getActiveCompanies()
    return NextResponse.json(companies)

  } catch (error) {
    console.error('Error fetching companies for admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyData = await request.json()

    // Validation
    if (!companyData.name || !companyData.role || !companyData.location) {
      return NextResponse.json({ 
        error: 'Company name, role, and location are required' 
      }, { status: 400 })
    }

    // Process deadlines to ensure proper structure
    const processedDeadlines = Array.isArray(companyData.deadlines) 
      ? companyData.deadlines.filter(deadline => 
          deadline && (deadline.type || deadline.date)
        ).map(deadline => ({
          type: deadline.type || '',
          date: deadline.date || '',
          time: deadline.time || '23:59',
          description: deadline.description || ''
        }))
      : [];

    // Process apply links to ensure proper structure
    const processedApplyLinks = Array.isArray(companyData.applyLinks)
      ? companyData.applyLinks.filter(link => 
          link && link.url
        ).map(link => ({
          title: link.title || 'Apply Here',
          url: link.url
        }))
      : [];

    // Create the company with all fields including new ones
    const dataToSave = {
      name: companyData.name,
      role: companyData.role,
      location: companyData.location,
      duration: companyData.duration || '',
      cgpaCriteria: companyData.cgpaCriteria || null,
      backlogsAllowed: companyData.backlogsAllowed || null, // ADDED BACKLOGS FIELD
      pay: companyData.pay || '',
      branchesEligible: Array.isArray(companyData.branchesEligible) ? companyData.branchesEligible : [],
      companyInfo: companyData.companyInfo || '',
      roleInfo: companyData.roleInfo || '',
      deadlines: processedDeadlines,
      applyLinks: processedApplyLinks,
      isActive: true,
      createdBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await createCompany(dataToSave)

    // ==================== EMAIL FUNCTIONALITY ====================
    if (result.insertedId) {
      // Schedule deadline reminders and send new company alerts in background
      setTimeout(async () => {
        try {
          // Schedule deadline reminders for users who will mark interest
          if (processedDeadlines.length > 0) {
            await scheduleEmailReminders(result.insertedId.toString(), dataToSave);
            console.log(`✅ Deadline reminders scheduled for ${dataToSave.name}`);
          }
          
          // Send new company alerts to eligible users immediately
          await sendNewCompanyAlertsToUsers(result.insertedId.toString(), dataToSave);
          console.log(`✅ New company alerts sent for ${dataToSave.name}`);
          
        } catch (emailError) {
          console.error('Failed to send emails:', emailError);
          // Don't fail the company creation if emails fail
        }
      }, 1000); // Small delay to ensure company is properly saved
    }

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      companyId: result.insertedId,
      savedData: {
        name: dataToSave.name,
        duration: dataToSave.duration,
        deadlinesCount: dataToSave.deadlines.length,
        applyLinksCount: dataToSave.applyLinks.length
      }
    })

  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

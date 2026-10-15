import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Helper functions for your API routes
export async function findUser(email) {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    const user = await db.collection('users').findOne({ email })
    return user
  } catch (error) {
    console.error('Error finding user:', error)
    throw error
  }
}

export async function updateUser(email, updateData) {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    
    const result = await db.collection('users').updateOne(
      { email },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    )
    
    return result
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function getActiveCompanies() {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    
    // Get all companies from the jobportal database
    const allCompanies = await db.collection('companies').find({
      $or: [
        { isActive: true },
        { isActive: { $exists: false } },
        { isActive: null }
      ]
    }).sort({ createdAt: -1 }).toArray()
    
    return allCompanies
    
  } catch (error) {
    console.error('Error fetching companies:', error)
    throw error
  }
}

export async function createCompany(companyData) {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    
    const result = await db.collection('companies').insertOne({
      ...companyData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    })
    
    return result
  } catch (error) {
    console.error('Error creating company:', error)
    throw error
  }
}

export async function updateCompany(id, updateData) {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    
    const result = await db.collection('companies').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    return result
  } catch (error) {
    console.error('Error updating company:', error)
    throw error
  }
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    return { client, db }
  } catch (error) {
    console.error('Error connecting to database:', error)
    throw error
  }
}

// Debug function to check all users in database (for admin use only)
export async function debugAllUsers() {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    
    const users = await db.collection('users').find({}).toArray()
    return users
  } catch (error) {
    console.error('Error fetching all users:', error)
    return []
  }
}

// Debug function to check all collections in database (for admin use only)
export async function debugCollections() {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    
    const collections = await db.listCollections().toArray()
    return collections
  } catch (error) {
    console.error('Error listing collections:', error)
    return []
  }
}

// Helper function to get company by ID
export async function getCompanyById(id) {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    })
    
    return company
  } catch (error) {
    console.error('Error fetching company by ID:', error)
    throw error
  }
}

// Helper function to delete company (soft delete)
export async function deleteCompany(id) {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    
    const result = await db.collection('companies').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isActive: false,
          deletedAt: new Date()
        }
      }
    )
    
    return result
  } catch (error) {
    console.error('Error deleting company:', error)
    throw error
  }
}

// Helper function to get user statistics
export async function getUserStats() {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    
    const totalUsers = await db.collection('users').countDocuments()
    const usersWithProfiles = await db.collection('users').countDocuments({
      branch: { $exists: true, $ne: null },
      cgpa: { $exists: true, $ne: null },
      backlogs: { $exists: true, $ne: null }
    })
    
    return {
      totalUsers,
      usersWithProfiles,
      usersWithoutProfiles: totalUsers - usersWithProfiles
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    throw error
  }
}

// ==================== EMAIL FUNCTIONALITY ====================

// Get all users with complete profiles
export async function findAllUsers() {
  try {
    const client = await clientPromise
    const db = client.db('jobportal')
    const users = await db.collection('users').find({
      branch: { $exists: true, $ne: null },
      cgpa: { $exists: true, $ne: null }
    }).toArray()
    return users
  } catch (error) {
    console.error('Error finding all users:', error)
    throw error
  }
}

// Check if user is eligible for company - UPDATED TO INCLUDE BACKLOGS
function checkUserEligibility(user, company) {
  // CGPA check
  const meetsCGPA = !company.cgpaCriteria || 
    (user.cgpa && parseFloat(user.cgpa) >= parseFloat(company.cgpaCriteria))
  
  // Branch check
  const meetsBranch = !company.branchesEligible || 
    company.branchesEligible.length === 0 || 
    (user.branch && company.branchesEligible.some(eligibleBranch => {
      const userBranch = user.branch.toLowerCase()
      const eligible = eligibleBranch.toLowerCase()
      return eligible.includes(userBranch) || userBranch.includes(eligible)
    }))
  
  // Backlog check - NEW
  const meetsBacklogs = company.backlogsAllowed === null || 
    company.backlogsAllowed === undefined || 
    (user.backlogs !== null && user.backlogs !== undefined && 
     parseInt(user.backlogs) <= parseInt(company.backlogsAllowed || 999))
  
  return meetsCGPA && meetsBranch && meetsBacklogs
}

// Schedule deadline reminder emails
export async function scheduleEmailReminders(companyId, company) {
  try {
    const { db } = await connectToDatabase()
    
    if (!company.deadlines || company.deadlines.length === 0) return
    
    const users = await findAllUsers()
    const emailReminders = []
    
    for (const deadline of company.deadlines) {
      if (!deadline.date || !deadline.time) continue
      
      // Parse deadline date and time (DD-MM-YYYY format)
      const [day, month, year] = deadline.date.split('-')
      const [hours, minutes] = deadline.time.split(':')
      const deadlineDateTime = new Date(year, month - 1, day, hours, minutes)
      
      // Schedule 1 day before reminder
      const oneDayBefore = new Date(deadlineDateTime.getTime() - (24 * 60 * 60 * 1000))
      
      // Schedule 4 hours before reminder
      const fourHoursBefore = new Date(deadlineDateTime.getTime() - (4 * 60 * 60 * 1000))
      
      // Only schedule if deadline is in the future
      const now = new Date()
      
      for (const user of users) {
        // Check if user is eligible
        const isEligible = checkUserEligibility(user, company)
        if (!isEligible) continue
        
        // Schedule 1 day before email
        if (oneDayBefore > now) {
          emailReminders.push({
            userEmail: user.email,
            companyId: companyId,
            companyName: company.name,
            role: company.role,
            deadline: deadline,
            reminderType: '1day',
            scheduledFor: oneDayBefore,
            sent: false,
            retryCount: 0,
            createdAt: new Date()
          })
        }
        
        // Schedule 4 hours before email
        if (fourHoursBefore > now) {
          emailReminders.push({
            userEmail: user.email,
            companyId: companyId,
            companyName: company.name,
            role: company.role,
            deadline: deadline,
            reminderType: '4hour',
            scheduledFor: fourHoursBefore,
            sent: false,
            retryCount: 0,
            createdAt: new Date()
          })
        }
      }
    }
    
    if (emailReminders.length > 0) {
      await db.collection('emailReminders').insertMany(emailReminders)
      console.log(`📧 Scheduled ${emailReminders.length} email reminders for ${company.name}`)
    }
    
    return { success: true, scheduled: emailReminders.length }
  } catch (error) {
    console.error('Error scheduling email reminders:', error)
    throw error
  }
}

// Send new company alerts to eligible users - UPDATED TO INCLUDE USER BACKLOGS
export async function sendNewCompanyAlertsToUsers(companyId, company) {
  try {
    const users = await findAllUsers()
    let sentCount = 0
    
    // Import here to avoid circular dependency
    const { sendNewCompanyAlert } = await import('./sendMail')
    
    // Send to eligible users
    for (const user of users) {
      if (checkUserEligibility(user, company)) {
        try {
          await sendNewCompanyAlert(
            user.email, 
            user.name, 
            company, 
            user.branch, 
            user.cgpa,
            user.backlogs || 0  // ADDED BACKLOGS PARAMETER
          )
          sentCount++
          
          // Add small delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (emailError) {
          console.error(`Failed to send new company alert to ${user.email}:`, emailError)
        }
      }
    }
    
    console.log(`✅ Sent new company alerts to ${sentCount} eligible users`)
    return { success: true, sent: sentCount }
  } catch (error) {
    console.error('Error sending new company alerts:', error)
    throw error
  }
}

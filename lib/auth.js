import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "jobportal"
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Always ensure email is in token for middleware
      if (user) {
        token.email = user.email
        token.name = user.name
        token.id = user.id
      }
      
      // Make sure email persists across token refreshes
      if (!token.email && token.sub) {
        try {
          const client = await clientPromise
          const db = client.db('jobportal')
          const dbUser = await db.collection('users').findOne({ 
            _id: new ObjectId(token.sub) 
          })
          if (dbUser) {
            token.email = dbUser.email
            token.name = dbUser.name
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error)
        }
      }
      
      console.log('🎫 JWT Token created/updated:', { email: token.email, id: token.id })
      return token
    },
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        return true
      }
      return true
    },
    async session({ session, user, token }) {
      // For database strategy, user comes from adapter
      // For JWT strategy, use token
      const userData = user || token
      
      try {
        const client = await clientPromise
        const db = client.db('jobportal')
        const dbUser = await db.collection('users').findOne({ 
          email: session.user.email 
        })
        
        if (dbUser) {
          session.user.id = dbUser._id
          session.user.branch = dbUser.branch
          session.user.cgpa = dbUser.cgpa
          session.user.backlogs = dbUser.backlogs
          session.user.isComplete = !!(dbUser.branch && dbUser.cgpa !== undefined && dbUser.backlogs !== undefined)
        } else {
          session.user.id = userData.id
          session.user.branch = userData.branch
          session.user.cgpa = userData.cgpa
          session.user.backlogs = userData.backlogs
          session.user.isComplete = !!(userData.branch && userData.cgpa !== undefined && userData.backlogs !== undefined)
        }
        
        // Use the isAdmin function for consistency
        session.user.isAdmin = isAdmin(session.user.email)
        console.log('👤 Session created for:', session.user.email, 'Admin:', session.user.isAdmin)
      } catch (error) {
        console.error('Error in session callback:', error)
        session.user.id = userData.id
        session.user.isAdmin = isAdmin(session.user.email)
      }
      
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'database',
  },
  // Add this to ensure JWT tokens are created even with database sessions
  jwt: {
    strategy: 'database',
  },
}

export default NextAuth(authOptions)

// Updated isAdmin function to use environment variable with fallback defaults
export function isAdmin(email) {
  if (!email) return false
  
  const defaultAdminEmails = [
    'team.gitthatoffer@gmail.com',
    'pranav.sin123@gmail.com',
    'atharv.del1610@gmail.com',
    'guptatanvi.099@gmail.com',
  ]
  
  const envAdminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || []
  const adminEmails = [...new Set([...defaultAdminEmails, ...envAdminEmails])]
  return adminEmails.includes(email)
}

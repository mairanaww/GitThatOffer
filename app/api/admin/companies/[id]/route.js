import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, isAdmin } from '../../../../../lib/auth'
import clientPromise from '../../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    const client = await clientPromise
    const db = client.db('jobportal')
    
    const result = await db.collection('companies').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...data,
          updatedBy: session.user.email,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = params
    const client = await clientPromise
    const db = client.db('jobportal')
    
    const result = await db.collection('companies').deleteOne(
      { _id: new ObjectId(id) }
    )
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
  }
}

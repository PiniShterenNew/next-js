import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { UserJSON } from "@clerk/backend";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response('Error occurred', { status: 500 })
  }
}

async function handleUserCreated(userData: UserJSON) {
  const { id, email_addresses, first_name, last_name, image_url } = userData

  try {
    // Create user in our database
    const user = await db.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0]?.email_address || '',
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null,
      },
    })

    // Create default user settings
    await db.userSettings.create({
      data: {
        userId: user.id,
        businessName: `${first_name || ''} ${last_name || ''}`.trim() || 'My Business',
        taxRate: 17, // Default VAT in Israel
        currency: 'ILS',
        invoicePrefix: 'INV',
        nextInvoiceNumber: 1,
      },
    })

    console.log('User created successfully:', user.id)
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

async function handleUserUpdated(userData: UserJSON) {
  const { id, email_addresses, first_name, last_name, image_url } = userData

  try {
    await db.user.update({
      where: { clerkId: id },
      data: {
        email: email_addresses[0]?.email_address || '',
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null,
      },
    })

    console.log('User updated successfully:', id)
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

async function handleUserDeleted(userData: any) {
  const { id } = userData

  try {
    await db.user.delete({
      where: { clerkId: id },
    })

    console.log('User deleted successfully:', id)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
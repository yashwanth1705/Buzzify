'use server'

import { Resend } from 'resend'
import NewMessageEmail from '../components/emails/new-message-email'
import { createClient } from '@supabase/supabase-js'

export async function sendNotificationEmail(messageId: number, title: string, content: string, senderName: string, priority: string, recipients: string, _customGroups?: number[]) {
    // eslint-disable-next-line no-console
    console.log('[Email Action] Custom groups:', _customGroups)
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[Email Action] RESEND_API_KEY is not set. Email notifications skipped.')
            return { success: false, error: 'Missing API Key' }
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!supabaseServiceKey) {
            console.error('[Email Action] Checking Service Key: MISSING')
        } else {
            console.log('[Email Action] Checking Service Key: Present')
        }

        // Initialize Supabase Admin Client
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Initialize Resend
        const resend = new Resend(process.env.RESEND_API_KEY)

        // 1. Fetch Recipients
        let query = supabase.from('users').select('email, role, id')

        if (recipients !== 'all') {
            if (recipients === 'students' || recipients === 'student') {
                query = query.eq('role', 'student')
            } else if (recipients === 'staff') {
                query = query.eq('role', 'staff')
            }
        }

        // TODO: Handle custom groups logic if needed, for now simplified to roles

        const { data: users, error } = await query

        if (error || !users) {
            console.error('[Email Action] Failed to fetch users from Supabase:', error)
            return { success: false, error: 'Failed to fetch recipients' }
        }

        console.log('[Email Action] Users fetched count:', users.length)

        // Filter out sender? (Optional)
        const recipientEmails = users
            .filter(u => u.email && u.email.includes('@')) // Basic validation
            .map(u => u.email)

        console.log('[Email Action] Valid emails to send to:', recipientEmails)

        if (recipientEmails.length === 0) {
            console.warn('[Email Action] No valid recipients found')
            return { success: true, count: 0 }
        }

        // 2. Send Emails
        const limitedRecipients = recipientEmails.slice(0, 5) // Safety limit for dev

        console.log('[Email Action] Sending to Resend with recipients:', limitedRecipients)

        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'Campus Portal <notifications@piemaka.resend.app>',
            to: limitedRecipients,
            subject: `New Message: ${title}`,
            react: NewMessageEmail({
                title,
                senderName,
                priority,
                previewText: content.substring(0, 100),
                link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?id=${messageId}`,
            }),
        })

        if (emailError) {
            console.error('[Email Action] Result sending email:', emailError)
            return { success: false, error: emailError }
        }

        return { success: true, data: emailData }

    } catch (error) {
        console.error('[Email Action] Error in sendNotificationEmail:', error)
        return { success: false, error }
    }
}

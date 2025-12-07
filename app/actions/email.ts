'use server'

import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export async function sendNotificationEmail(messageId: number, title: string, content: string, senderName: string, priority: string, recipients: string, customGroups?: number[], manualEmails?: string[]) {
    console.log('[Email Action] Starting email notification (Gmail SMTP):', { messageId, recipients, customGroupsCount: customGroups?.length, manualEmailsCount: manualEmails?.length })

    try {
        const gmailUser = process.env.GMAIL_USER
        const gmailPass = process.env.GMAIL_APP_PASSWORD

        if (!gmailUser || !gmailPass) {
            console.warn('[Email Action] GMAIL_USER or GMAIL_APP_PASSWORD not set. Email notifications skipped.')
            return { success: false, error: 'Missing Gmail Credentials' }
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!supabaseServiceKey) {
            console.error('[Email Action] Missing Supabase Service Key')
            return { success: false, error: 'Missing Service Key' }
        }

        // Initialize Supabase Admin Client
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Fetch Recipients
        let recipientEmails: string[] = []

        // Fetch Recipients from Users table based on Role
        if (recipients !== 'group') {
            let query = supabase.from('users').select('email')

            if (recipients === 'students' || recipients === 'student') {
                query = query.eq('role', 'student')
            } else if (recipients === 'staff') {
                query = query.eq('role', 'staff')
            } else if (recipients === 'admins' || recipients === 'admin') {
                query = query.eq('role', 'admin')
            }
            // For 'all', we don't add filters (fetches everyone)

            const { data: users, error } = await query

            if (error || !users) {
                console.error('[Email Action] Failed to fetch users:', error)
            } else {
                const userEmails = users
                    .filter(u => u.email && u.email.includes('@'))
                    .map(u => u.email)
                recipientEmails = [...recipientEmails, ...userEmails]
            }
        }

        // Fetch Recipients from Custom Groups
        if (customGroups && customGroups.length > 0) {
            const { data: groups, error: groupsError } = await supabase
                .from('groups')
                .select('members')
                .in('id', customGroups)

            if (groupsError) {
                console.error('[Email Action] Failed to fetch groups:', groupsError)
            } else if (groups) {
                groups.forEach(group => {
                    if (Array.isArray(group.members)) {
                        recipientEmails = [...recipientEmails, ...group.members]
                    }
                })
            }
        }

        // Add Manual Emails
        if (manualEmails && manualEmails.length > 0) {
            console.log('[Email Action] Adding manual emails:', manualEmails)
            recipientEmails = [...recipientEmails, ...manualEmails]
        }

        // Deduplicate and Validation
        recipientEmails = [...new Set(recipientEmails)]
        recipientEmails = recipientEmails.filter(email => email && email.includes('@'))

        console.log(`[Email Action] Total unique recipients: ${recipientEmails.length}`)

        if (recipientEmails.length === 0) {
            console.warn('[Email Action] No valid recipients found')
            return { success: true, count: 0 }
        }

        // 2. Configure Nodemailer Transporter (Gmail)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: gmailUser,
                pass: gmailPass,
            },
        })

        // 3. Send Email (Using BCC for privacy)
        // Similar to the PHP example, but handling bulk via BCC

        const messageLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?id=${messageId}`

        const htmlContent = `
            <h3>You have a new message!</h3>
            <p><b>From:</b> ${senderName} (${priority} priority)</p>
            <p><b>Title:</b> ${title}</p>
            <p><b>Preview:</b> ${content.substring(0, 100)}...</p>
            <br>
            <p><a href="${messageLink}">Click here to view the full message on the portal</a></p>
            <br>
            <small>Please do not reply to this email.</small>
        `

        // Split into batches to be safe with Gmail limits (even though we are using BCC)
        // Gmail limit is 500/day. 
        // We put recipients in BCC.
        const BATCH_SIZE = 95 // Keep under 100 per email
        const chunks = []
        for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
            chunks.push(recipientEmails.slice(i, i + BATCH_SIZE));
        }

        console.log(`[Email Action] Sending in ${chunks.length} batches...`)

        const results = await Promise.all(chunks.map(async (batch) => {
            return transporter.sendMail({
                from: `"Campus Admin" <${gmailUser}>`, // sender address
                to: gmailUser, // Send to self
                bcc: batch, // Actual recipients
                subject: `New Message: ${title}`, // Subject line
                html: htmlContent, // html body
            })
        }))

        console.log('[Email Action] All emails sent successfully')
        return { success: true, count: recipientEmails.length }

    } catch (error) {
        console.error('[Email Action] Error in sendNotificationEmail:', error)
        return { success: false, error }
    }
}

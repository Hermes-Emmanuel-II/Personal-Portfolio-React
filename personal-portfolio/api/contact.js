const MB = 1000 * 1000
const MAX_TOTAL_SIZE = 4 * MB
const MAX_FILES = 10
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'application/pdf']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function reply (status, body) {
    return Response.json(body, { status })
}

function escapeHtml (text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export async function POST (request) {
    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.CONTACT_TO
    if (!apiKey || !to) {
        console.error('Missing RESEND_API_KEY or CONTACT_TO environment variable')
        return reply(500, { error: 'Email isn\'t set up yet. Please try again later.' })
    }

    let data
    try {
        data = await request.formData()
    } catch {
        return reply(400, { error: 'Couldn\'t read the form. Please try again.' })
    }

    // Honeypot: real visitors never see or fill this field
    if (String(data.get('company') || '').trim()) return reply(200, { ok: true })

    const name = String(data.get('name') || '').trim().slice(0, 100)
    const email = String(data.get('email') || '').trim().slice(0, 200)
    const message = String(data.get('message') || '').trim().slice(0, 5000)

    if (!name || !email || !message) return reply(400, { error: 'Please fill in your name, email and message.' })
    if (!EMAIL_PATTERN.test(email)) return reply(400, { error: 'That email address doesn\'t look right.' })

    const files = data.getAll('attachments').filter(file => typeof file === 'object' && file.size > 0)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    if (files.length > MAX_FILES) return reply(400, { error: `Attach ${ MAX_FILES } files or fewer.` })
    if (totalSize > MAX_TOTAL_SIZE) return reply(413, { error: `Attachments are over ${ MAX_TOTAL_SIZE / MB } MB.` })
    if (files.some(file => !ACCEPTED_TYPES.includes(file.type))) return reply(400, { error: 'Only PNG, JPEG or PDF files can be attached.' })

    const attachments = await Promise.all(files.map(async file => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()).toString('base64')
    })))

    const fileList = files.length ? `\n\nAttachments: ${ files.map(file => file.name).join(', ') }` : ''

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${ apiKey }`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
            to: [to],
            reply_to: email,
            subject: `Portfolio message from ${ name }`,
            text: `From: ${ name } <${ email }>\n\n${ message }${ fileList }`,
            html: `<p><strong>From:</strong> ${ escapeHtml(name) } &lt;${ escapeHtml(email) }&gt;</p>`
                + `<p style="white-space: pre-wrap">${ escapeHtml(message) }</p>`
                + (files.length ? `<p><strong>Attachments:</strong> ${ files.map(file => escapeHtml(file.name)).join(', ') }</p>` : ''),
            attachments
        })
    })

    if (!response.ok) {
        console.error('Resend error', response.status, await response.text())
        return reply(502, { error: 'Couldn\'t send right now. Please try again.' })
    }

    return reply(200, { ok: true })
}
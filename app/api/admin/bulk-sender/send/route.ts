import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { protectAdminRoute } from '@/lib/admin/middleware';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase Admin Client (for logging sends)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    // 1. Verify Admin Auth
    const authResponse = await protectAdminRoute(request);
    if (authResponse) return authResponse;

    try {
        const body = await request.json();
        const { recipients, subject, html } = body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ success: false, error: 'No recipients provided' }, { status: 400 });
        }

        // 2. Create Campaign Record (if not exists, maybe pass campaign ID later)
        // For now, we'll just log individual sends or create a campaign on the fly?
        // Let's create a campaign record for this batch if it's the first batch, 
        // but since the frontend handles batching, we might want to pass a campaign ID.
        // To keep it simple as requested: just send. We'll log to the table we created.

        // 3. Prepare Batch for Resend
        // 2. Fetch unsubscribed emails
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: unsubscribedData } = await supabase
            .from('newsletter_unsubscribes')
            .select('email');

        const unsubscribedSet = new Set((unsubscribedData || []).map((u: any) => u.email.toLowerCase()));

        // 3. Filter recipients
        const validRecipients = recipients.filter((r: any) => !unsubscribedSet.has(r.email.toLowerCase()));
        const skippedCount = recipients.length - validRecipients.length;

        if (skippedCount > 0) {
            console.log(`Skipping ${skippedCount} unsubscribed recipients.`);
        }

        if (validRecipients.length === 0) {
            return NextResponse.json({
                success: true,
                sent: 0,
                failed: 0,
                message: 'All recipients were unsubscribed.'
            });
        }

        // Resend Batch API allows up to 100 emails.
        // We expect the frontend to send batches of 50-100.

        const emailBatch = validRecipients.map((recipient: any) => {
            const fullHtml = html
                .replace(/{{name}}/g, recipient.name || '')
                .replace(/{{email}}/g, recipient.email); // Replace {{email}} for unsubscribe link

            return {
                from: 'kriszti@eredeticsakra.hu',
                to: recipient.email,
                subject: subject,
                html: fullHtml,
                headers: {
                    'X-Entity-Ref-ID': crypto.randomUUID(), // Unique ID for tracking
                },
                tags: [
                    { name: 'category', value: 'bulk_newsletter' },
                    { name: 'source', value: 'admin_bulk_sender' }
                ]
            };
        });

        // 4. Send via Resend
        console.log('Sending batch of', emailBatch.length, 'emails...');
        const result = await resend.batch.send(emailBatch);
        console.log('Resend API Raw Response:', JSON.stringify(result, null, 2));

        // 5. Extract data from Resend response
        // The SDK returns { data: { data: [...] }, error: ... } or similar structure depending on version
        // We need to be robust here.
        let emailResults: any[] = [];

        if (result.data && Array.isArray(result.data)) {
            emailResults = result.data;
        } else if (result.data && (result.data as any).data && Array.isArray((result.data as any).data)) {
            emailResults = (result.data as any).data;
        }

        // Calculate success count
        const sentCount = emailResults.filter((item: any) => item.id).length;
        const failedCount = recipients.length - sentCount;

        console.log('Parsed stats:', { sentCount, failedCount });

        return NextResponse.json({
            success: true,
            sent: sentCount,
            failed: failedCount,
            debug: { result } // Return debug info to frontend to see what happened
        });

    } catch (error: any) {
        console.error('Bulk send error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

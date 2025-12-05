'use client';

import { useState } from 'react';
import { CSVUploader, Recipient } from '@/components/bulk-sender/CSVUploader';
import { EmailEditor } from '@/components/bulk-sender/EmailEditor';
import { SendingProgress } from '@/components/bulk-sender/SendingProgress';
import { toast } from 'sonner';
import { Send, Save, Trash2 } from 'lucide-react';

const MARKETING_TEMPLATE = `<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eredeti Csakra - Állapotfelmérés</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .header {
            background: linear-gradient(135deg, #6b21a8 0%, #a855f7 100%);
            padding: 30px 20px;
            text-align: center;
        }

        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 1px;
        }

        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 20px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 20px;
        }

        .text-block {
            margin-bottom: 20px;
            color: #4b5563;
        }

        .highlight {
            color: #7e22ce;
            font-weight: 600;
        }

        .cta-container {
            text-align: center;
            margin: 35px 0;
        }

        .cta-button {
            display: inline-block;
            background-color: #7e22ce;
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 4px 14px rgba(126, 34, 206, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .cta-button:hover {
            background-color: #6b21a8;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(126, 34, 206, 0.6);
        }

        .cta-subtext {
            display: block;
            margin-top: 10px;
            font-size: 12px;
            color: #9ca3af;
        }

        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }

        .footer {
            background-color: #f3f4f6;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        }

        .footer a {
            color: #6b7280;
            text-decoration: underline;
        }
    </style>
</head>

<body>
    <div style="padding: 20px;">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>EREDETI CSAKRA</h1>
            </div>

            <!-- Content -->
            <div class="content">
                <div class="greeting">Szia {{name}}!</div>

                <p class="text-block">
                    Érezted mostanában, hogy bár mindent megteszel, mégsem úgy haladsz az életedben, ahogy szeretnél?
                    Hogy délutánra megmagyarázhatatlanul elfogy az energiád, vagy feszültség van benned, aminek nincs
                    valódi oka?
                </p>

                <p class="text-block">
                    Ez nem a véletlen műve. Az ősi tanítások szerint az életünk elakadásai – legyen szó pénzügyekről,
                    párkapcsolatról vagy egészségről – gyakran egyetlen <span class="highlight">energia-központ (csakra)
                        alulműködésére</span> vezethetők vissza.
                </p>

                <div
                    style="background-color: #f5f3ff; border-left: 4px solid #7e22ce; padding: 15px; margin: 25px 0; font-style: italic; color: #581c87;">
                    "Ha egy csakra blokkolva van, az olyan, mintha behúzott kézifékkel próbálnál vezetni."
                </div>

                <p class="text-block">
                    De honnan tudhatod, melyik a 7 közül a "bűnös"? És ami még fontosabb: hogyan oldhatod fel ezt a
                    blokkot?
                </p>

                <p class="text-block">
                    Elkészítettünk egy gyors, ingyenes elemzést, ami segít feltérképezni a jelenlegi energetikai
                    állapotodat.
                </p>

                <!-- CTA Button -->
                <div class="cta-container">
                    <a href="https://eredeticsakra.hu/" class="cta-button">INGYENES CSAKRA ÁLLAPOT ELLENŐRZÉSE</a>
                    <span class="cta-subtext">Már több mint 15.000-en töltötték ki</span>
                </div>

                <p class="text-block">
                    Ne hagyd, hogy egy rejtett blokk visszatartson a teljes élettől. Nézzünk rá együtt!
                </p>

                <div class="divider"></div>

                <p class="text-block" style="margin-bottom: 0;">
                    Szeretettel:<br>
                    <strong>Az Eredeti Csakra csapata</strong>
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>© 2025 Eredeti Csakra. Minden jog fenntartva.</p>
                <p>
                    <a href="https://eredeticsakra.hu/newsletter/unsubscribe?email={{email}}">Leiratkozás</a>
                </p>
            </div>
        </div>
    </div>
</body>

</html>`;

export default function BulkSenderPage() {
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendStats, setSendStats] = useState({ sent: 0, failed: 0 });
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const loadMarketingTemplate = () => {
        if (htmlContent && htmlContent !== '<p></p>' && !confirm('A jelenlegi tartalom felülíródik. Folytatod?')) {
            return;
        }
        setHtmlContent(MARKETING_TEMPLATE);
        setSubject('⚠️ Egy blokkolt csakra állhat a fáradtságod mögött?');
        toast.success('Marketing sablon betöltve!');
    };

    const handleSend = async () => {
        if (recipients.length === 0) {
            toast.error('Kérlek tölts fel címzetteket!');
            return;
        }
        if (!subject) {
            toast.error('Kérlek add meg a tárgyat!');
            return;
        }
        if (!htmlContent || htmlContent === '<p></p>') {
            toast.error('Kérlek írj üzenetet!');
            return;
        }

        if (!confirm(`Biztosan kiküldöd a levelet ${recipients.length} címzettnek?`)) {
            return;
        }

        setIsSending(true);
        setSendStats({ sent: 0, failed: 0 });

        const controller = new AbortController();
        setAbortController(controller);

        try {
            // Batch processing logic
            const BATCH_SIZE = 50; // Resend limit safe batch
            const DELAY_MS = 8000; // 8 seconds delay for "flow-like" sending

            for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
                if (controller.signal.aborted) break;

                const batch = recipients.slice(i, i + BATCH_SIZE);

                try {
                    const response = await fetch('/api/admin/bulk-sender/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            recipients: batch,
                            subject,
                            html: htmlContent,
                        }),
                        signal: controller.signal,
                    });

                    const result = await response.json();

                    if (result.success) {
                        setSendStats(prev => ({
                            sent: prev.sent + result.sent,
                            failed: prev.failed + result.failed
                        }));
                    } else {
                        setSendStats(prev => ({
                            sent: prev.sent,
                            failed: prev.failed + batch.length
                        }));
                        console.error('Batch failed:', result.error);
                    }
                } catch (error) {
                    console.error('Network error sending batch:', error);
                    setSendStats(prev => ({
                        sent: prev.sent,
                        failed: prev.failed + batch.length
                    }));
                }

                // Wait before next batch if not the last one
                if (i + BATCH_SIZE < recipients.length) {
                    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
                }
            }

            toast.success('Küldés befejezve!');
        } catch (error: any) {
            if (error.name === 'AbortError') {
                toast.info('Küldés megszakítva.');
            } else {
                toast.error('Hiba történt a küldés során.');
                console.error(error);
            }
        } finally {
            setIsSending(false);
            setAbortController(null);
        }
    };

    const handleStop = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsSending(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tömeges Email Küldő</h1>
                    <p className="text-gray-500 mt-1">Független hírlevélküldő rendszer</p>
                </div>
                <div className="flex gap-2">
                    {/* Future: Save draft functionality */}
                </div>
            </div>

            <div className="grid gap-8">
                {/* 1. Címzettek */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                        Címzettek feltöltése
                    </h2>
                    <CSVUploader onUpload={setRecipients} disabled={isSending} />
                </section>

                {/* 2. Tartalom */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            Levél szerkesztése
                        </h2>
                        <button
                            onClick={loadMarketingTemplate}
                            disabled={isSending}
                            className="text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Marketing Sablon Betöltése
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tárgy
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={isSending}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                placeholder="Pl. Havi hírlevél..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tartalom
                            </label>
                            <EmailEditor initialContent={htmlContent} onChange={setHtmlContent} />
                        </div>
                    </div>
                </section>

                {/* 3. Küldés */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                        Küldés
                    </h2>

                    {isSending || sendStats.sent > 0 || sendStats.failed > 0 ? (
                        <SendingProgress
                            total={recipients.length}
                            sent={sendStats.sent}
                            failed={sendStats.failed}
                            status={isSending ? 'sending' : 'completed'}
                            onStop={handleStop}
                        />
                    ) : (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Összesen: {recipients.length} címzett
                                </p>
                                <p className="text-sm text-gray-500">
                                    A küldés kötegelt módon történik a limitációk miatt.
                                </p>
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={recipients.length === 0 || !subject}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                                Küldés indítása
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

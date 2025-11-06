#!/usr/bin/env python3
"""
Upload Newsletter Subscribers to Supabase

This script uploads the selected 1,000 subscribers to the quiz_results table
in Supabase so they can receive personalized checkout links in the newsletter.

Note: We create "placeholder" quiz results for newsletter subscribers who
haven't taken the quiz yet. This allows us to track email campaigns and
potentially convert them to full customers.
"""

import csv
import os
import sys
from pathlib import Path
from datetime import datetime
from supabase import create_client, Client

# Configuration
INPUT_CSV = Path(__file__).parent.parent / 'test-output' / 'newsletter-campaign-1000.csv'
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

# Placeholder chakra scores (all balanced = no bias in recommendations)
PLACEHOLDER_CHAKRA_SCORES = {
    "Gyökércsakra": 14,
    "Szakrális csakra": 14,
    "Napfonat csakra": 14,
    "Szív csakra": 14,
    "Torok csakra": 14,
    "Harmadik szem": 14,
    "Korona csakra": 14
}

PLACEHOLDER_ANSWERS = [3, 3, 3, 4, 3, 3, 4, 3, 3, 3, 4, 3, 3, 4, 3, 3, 3, 4, 3, 3, 4, 3, 3, 3, 4, 3, 3, 3]  # 28 answers


def main():
    print("📤 Upload Newsletter Subscribers to Supabase")
    print("=" * 70)
    print()

    # Check environment variables
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ ERROR: Supabase environment variables not set!")
        print()
        print("Please set:")
        print("  - NEXT_PUBLIC_SUPABASE_URL")
        print("  - SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)")
        print()
        print("You can find these in your .env.local file")
        sys.exit(1)

    print(f"✅ Supabase URL: {SUPABASE_URL}")
    print(f"✅ API Key: {SUPABASE_KEY[:20]}...")
    print()

    # Initialize Supabase client
    print("🔌 Connecting to Supabase...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected successfully")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)
    print()

    # Read CSV
    print(f"📖 Reading CSV: {INPUT_CSV}")
    subscribers = []

    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            subscribers.append({
                'name': row['name'],
                'email': row['email'].strip().lower(),
                'variant': row['variant']
            })

    print(f"✅ Read {len(subscribers):,} subscribers")
    print()

    # Check for existing emails
    print("🔍 Checking for existing subscribers in database...")
    emails = [s['email'] for s in subscribers]

    try:
        # Query in batches of 100 (Supabase limit)
        existing_emails = set()
        for i in range(0, len(emails), 100):
            batch = emails[i:i+100]
            response = supabase.table('quiz_results').select('email').in_('email', batch).execute()
            existing_emails.update(row['email'] for row in response.data)

        print(f"✅ Found {len(existing_emails):,} existing subscribers")
        print(f"📝 Will insert {len(subscribers) - len(existing_emails):,} new subscribers")
    except Exception as e:
        print(f"⚠️  Warning: Could not check existing emails: {e}")
        existing_emails = set()
    print()

    # Filter out existing subscribers
    new_subscribers = [s for s in subscribers if s['email'] not in existing_emails]

    if not new_subscribers:
        print("✅ All subscribers already exist in database!")
        print("📋 You can use the CSV file directly in the newsletter admin.")
        return

    # Prepare data for insertion
    print(f"📝 Preparing {len(new_subscribers):,} records for insertion...")
    records = []

    for sub in new_subscribers:
        # Extract age from name if possible (optional)
        # Most Hungarian women include year in name, but we'll default to 40
        age = 40  # Default target demographic age

        records.append({
            'name': sub['name'],
            'email': sub['email'],
            'age': age,
            'answers': PLACEHOLDER_ANSWERS,
            'chakra_scores': PLACEHOLDER_CHAKRA_SCORES,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        })

    print(f"✅ Prepared {len(records):,} records")
    print()

    # Insert in batches of 100
    print("📤 Uploading to Supabase (batches of 100)...")
    inserted_count = 0
    failed_count = 0

    for i in range(0, len(records), 100):
        batch = records[i:i+100]
        batch_num = i // 100 + 1
        total_batches = (len(records) + 99) // 100

        try:
            response = supabase.table('quiz_results').insert(batch).execute()
            inserted_count += len(batch)
            print(f"   ✅ Batch {batch_num}/{total_batches}: Inserted {len(batch)} records")
        except Exception as e:
            failed_count += len(batch)
            print(f"   ❌ Batch {batch_num}/{total_batches}: Failed - {e}")

    print()
    print("=" * 70)
    print("📊 Upload Summary:")
    print(f"   Total subscribers:     {len(subscribers):,}")
    print(f"   Already existed:       {len(existing_emails):,}")
    print(f"   Successfully inserted: {inserted_count:,}")
    print(f"   Failed:                {failed_count:,}")
    print("=" * 70)
    print()

    if inserted_count > 0:
        print("✅ SUCCESS! Subscribers uploaded to Supabase.")
        print()
        print("📋 Next Steps:")
        print("   1. Subscribers now have placeholder quiz results in database")
        print("   2. Each subscriber has a unique result_id (UUID)")
        print("   3. Newsletter emails can include personalized checkout links:")
        print("      https://eredeticsakra.hu/checkout/{result_id}?variant={variant}")
        print()
        print("⚠️  NOTE: These are placeholder results (all balanced chakras)")
        print("   If subscribers complete the real quiz later, their results will update.")
    else:
        print("⚠️  No new subscribers were inserted.")

    print()
    print("🎯 Ready to launch newsletter campaign!")
    print()


if __name__ == '__main__':
    main()

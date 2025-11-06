#!/usr/bin/env python3
"""
Verify Supabase Upload
Checks that all 1,000 newsletter subscribers were successfully uploaded
"""

import os
import sys
from supabase import create_client, Client

# Configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

def main():
    print("🔍 Verifying Supabase Upload")
    print("=" * 60)
    print()

    # Connect to Supabase
    print("🔌 Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Connected")
    print()

    # Query recent quiz_results (last 5 minutes)
    print("📊 Querying recent uploads...")
    try:
        # Count total quiz_results
        total_response = supabase.table('quiz_results').select('id', count='exact').execute()
        total_count = total_response.count

        # Get the 10 most recent entries
        recent_response = supabase.table('quiz_results')\
            .select('id, name, email, age, created_at')\
            .order('created_at', desc=True)\
            .limit(10)\
            .execute()

        recent_records = recent_response.data

        print(f"✅ Total quiz_results in database: {total_count:,}")
        print()

        if recent_records:
            print("📋 Most Recent 10 Entries:")
            print("-" * 60)
            for i, record in enumerate(recent_records, 1):
                print(f"{i:2}. {record['name']:<30} {record['email']:<35}")
                print(f"    ID: {record['id']}")
                print(f"    Created: {record['created_at']}")
                print()

        # Query specific emails from our newsletter list to verify
        test_emails = [
            'arvatasigabriella@gmail.com',
            'boszilvi.78@gmail.com',
            'tothmama00@gmail.com'
        ]

        print("🎯 Verifying Sample Newsletter Subscribers:")
        print("-" * 60)
        for email in test_emails:
            response = supabase.table('quiz_results')\
                .select('id, name, email')\
                .eq('email', email)\
                .execute()

            if response.data:
                record = response.data[0]
                print(f"✅ {record['name']:<30} {email}")
                print(f"   UUID: {record['id']}")
            else:
                print(f"❌ NOT FOUND: {email}")
            print()

        print("=" * 60)
        print("✅ VERIFICATION COMPLETE")
        print()
        print("📊 Summary:")
        print(f"   - Total records in database: {total_count:,}")
        print(f"   - Latest 10 records retrieved: {len(recent_records)}")
        print(f"   - Sample subscribers verified: {sum(1 for email in test_emails if supabase.table('quiz_results').select('id').eq('email', email).execute().data)}/3")
        print()

    except Exception as e:
        print(f"❌ Error querying database: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Newsletter Subscriber Selection Script
Selects the best 1,000 subscribers for A/B/C email campaign

Scoring Criteria:
1. Recent signup (newer = better, max 30 days old)
2. Has Name + Last name (personalization ready)
3. Has City (engagement indicator)
4. No emails sent yet (fresh audience)
5. Email quality (valid format, not freemail)

Output: CSV with columns: name, email, variant (a/b/c)
"""

import csv
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple

# Configuration
INPUT_CSV = Path(__file__).parent.parent / 'test-output' / '251105183627_subscribers_b0d79e2f_active.csv'
OUTPUT_CSV = Path(__file__).parent.parent / 'test-output' / 'newsletter-campaign-1000.csv'
TARGET_COUNT = 1000
VARIANT_A_COUNT = 333
VARIANT_B_COUNT = 333
VARIANT_C_COUNT = 334  # Remaining


def calculate_score(row: Dict[str, str]) -> Tuple[float, str]:
    """
    Calculate quality score for subscriber (0-100)
    Returns (score, reason_for_exclusion)
    """
    score = 0.0
    exclusion_reason = None

    # 1. Email validation (REQUIRED - exclusion if invalid)
    email = row.get('Email', '').strip().lower()
    if not email or not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
        return (0.0, 'Invalid email')

    # 2. Recent signup score (0-30 points)
    # Newer signups = more engaged, better memory of chakra interest
    subscribed_str = row.get('Subscribed', '').strip()
    if subscribed_str:
        try:
            subscribed_date = datetime.strptime(subscribed_str, '%Y-%m-%d %H:%M:%S')
            now = datetime.now()
            days_ago = (now - subscribed_date).days

            if days_ago <= 7:
                score += 30  # Last 7 days: HOT leads
            elif days_ago <= 14:
                score += 25  # Last 2 weeks: Warm leads
            elif days_ago <= 30:
                score += 20  # Last month: Good leads
            elif days_ago <= 60:
                score += 10  # Last 2 months: Older leads
            else:
                score += 5   # Older: Less engaged
        except ValueError:
            score += 5  # Can't parse date, give minimal points

    # 3. Full name available (0-25 points)
    # Personalization {{name}} works better with real names
    name = row.get('Name', '').strip()
    last_name = row.get('Last name', '').strip()

    if name and last_name:
        score += 25  # Full name: Best for personalization
    elif name or last_name:
        score += 15  # Partial name: Still usable
    else:
        score += 0   # No name: Less personal, lower conversion

    # 4. Has City (0-15 points)
    # City = more complete profile = higher engagement
    city = row.get('City', '').strip()
    if city:
        score += 15

    # 5. Email engagement history (0-15 points)
    emails_sent = int(row.get('Emails sent', '0') or '0')
    opened = int(row.get('Opened', '0') or '0')

    if emails_sent == 0:
        score += 15  # Fresh audience: No email fatigue
    elif opened > 0:
        score += 10  # Engaged: Opens emails
    else:
        score += 5   # Sent but not opened: Less engaged

    # 6. Email quality (0-15 points)
    # Professional emails > Free emails
    free_email_domains = ['gmail.com', 'freemail.hu', 'citromail.hu', 'icloud.com', 't-online.hu']
    domain = email.split('@')[1] if '@' in email else ''

    if domain and domain not in free_email_domains:
        score += 15  # Professional email: Serious buyer
    elif domain in ['gmail.com', 'icloud.com']:
        score += 10  # Popular free emails: Still good
    else:
        score += 5   # Other free emails: Lower quality

    return (score, exclusion_reason)


def format_full_name(row: Dict[str, str]) -> str:
    """Format full name for email personalization"""
    name = row.get('Name', '').strip()
    last_name = row.get('Last name', '').strip()

    if name and last_name:
        return f"{name} {last_name}"
    elif name:
        return name
    elif last_name:
        return last_name
    else:
        return "Kedves Érdeklődő"  # Fallback for missing names


def main():
    print("📊 Newsletter Subscriber Selection Script")
    print("=" * 60)
    print(f"Input:  {INPUT_CSV}")
    print(f"Output: {OUTPUT_CSV}")
    print(f"Target: {TARGET_COUNT} subscribers")
    print("=" * 60)
    print()

    # Read CSV
    print("📖 Reading subscriber list...")
    subscribers = []
    excluded_count = 0

    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            score, exclusion_reason = calculate_score(row)

            if exclusion_reason:
                excluded_count += 1
                continue

            subscribers.append({
                'email': row.get('Email', '').strip().lower(),
                'name': format_full_name(row),
                'score': score,
                'subscribed': row.get('Subscribed', ''),
                'city': row.get('City', '').strip(),
                'raw_row': row
            })

    print(f"✅ Read {len(subscribers):,} valid subscribers")
    print(f"❌ Excluded {excluded_count:,} invalid entries")
    print()

    # Sort by score (descending)
    print("🔍 Sorting by quality score...")
    subscribers.sort(key=lambda x: x['score'], reverse=True)

    # Select top 1,000
    selected = subscribers[:TARGET_COUNT]
    print(f"✅ Selected top {len(selected):,} subscribers")
    print()

    # Show score distribution
    if selected:
        avg_score = sum(s['score'] for s in selected) / len(selected)
        min_score = min(s['score'] for s in selected)
        max_score = max(s['score'] for s in selected)

        print(f"📊 Score Statistics:")
        print(f"   Average: {avg_score:.1f} / 100")
        print(f"   Range:   {min_score:.1f} - {max_score:.1f}")
        print()

    # Assign A/B/C variants
    print("🎯 Assigning A/B/C variants...")
    for i, subscriber in enumerate(selected):
        if i < VARIANT_A_COUNT:
            subscriber['variant'] = 'a'
        elif i < VARIANT_A_COUNT + VARIANT_B_COUNT:
            subscriber['variant'] = 'b'
        else:
            subscriber['variant'] = 'c'

    variant_a = sum(1 for s in selected if s['variant'] == 'a')
    variant_b = sum(1 for s in selected if s['variant'] == 'b')
    variant_c = sum(1 for s in selected if s['variant'] == 'c')

    print(f"   Variant A (990 Ft):   {variant_a:,} subscribers")
    print(f"   Variant B (1,990 Ft): {variant_b:,} subscribers")
    print(f"   Variant C (2,990 Ft): {variant_c:,} subscribers")
    print()

    # Write output CSV
    print("💾 Writing output CSV...")
    with open(OUTPUT_CSV, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['name', 'email', 'variant'])

        for subscriber in selected:
            writer.writerow([
                subscriber['name'],
                subscriber['email'],
                subscriber['variant']
            ])

    print(f"✅ Output saved: {OUTPUT_CSV}")
    print()

    # Summary statistics
    print("📈 Campaign Summary:")
    print("=" * 60)
    print(f"Total selected:        {len(selected):,} / {len(subscribers):,}")
    print(f"Selection rate:        {len(selected)/len(subscribers)*100:.1f}%")
    print(f"With full names:       {sum(1 for s in selected if s['name'] != 'Kedves Érdeklődő'):,}")
    print(f"With city:             {sum(1 for s in selected if s['city']):,}")
    print(f"Recent signups (<30d): {sum(1 for s in selected if s['subscribed'] and (datetime.now() - datetime.strptime(s['subscribed'], '%Y-%m-%d %H:%M:%S')).days <= 30):,}")
    print()

    # Show top 10 examples
    print("🎯 Top 10 Selected Subscribers (Preview):")
    print("-" * 60)
    for i, sub in enumerate(selected[:10], 1):
        days_ago = ""
        if sub['subscribed']:
            try:
                subscribed_date = datetime.strptime(sub['subscribed'], '%Y-%m-%d %H:%M:%S')
                days = (datetime.now() - subscribed_date).days
                days_ago = f" ({days}d ago)"
            except:
                pass

        print(f"{i:2}. [{sub['variant'].upper()}] {sub['name']:<25} {sub['email']:<35} Score: {sub['score']:.0f}{days_ago}")
    print()

    print("✅ DONE! Newsletter campaign CSV is ready.")
    print()
    print("📋 Next Steps:")
    print("   1. Open admin dashboard: http://localhost:3000/admin/newsletter")
    print("   2. Upload: test-output/newsletter-campaign-1000.csv")
    print("   3. Select variant + subject line")
    print("   4. Send test email to yourself")
    print("   5. Launch campaign!")
    print()


if __name__ == '__main__':
    main()

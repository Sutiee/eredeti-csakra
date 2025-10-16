# Test Data Seed Script

This script generates realistic test data for the Eredeti Csakra admin dashboard, including quiz results, purchases, analytics events, and page views.

## Overview

The seed script creates:
- **100 quiz results** with realistic Hungarian names, ages (25-65), and chakra scores
- **30 purchases** distributed across product types (chakra-insight, full-report, meditation packages, bundles)
- **200 analytics events** (page views, quiz starts, completions, checkout events, purchases)
- **300 page views** across different pages with UTM tracking

All data spans the last 90 days with realistic date distributions.

## Usage

### Dry Run (Preview Only)

Preview the SQL queries that will be generated without inserting data:

```bash
npm run seed:dry
```

This will display all SQL queries that would be executed. Use this to:
- Verify the data looks correct
- Review SQL before execution
- Copy queries for manual execution

### Execute Seed Data

**Important:** Currently, this script generates SQL output only. To insert the data:

1. Run the dry-run command to generate SQL:
```bash
npm run seed:dry > seed-data.sql
```

2. Copy the SQL statements and execute them in Supabase SQL Editor:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Paste and execute the SQL queries in batches

**Note:** The script is designed to work with Supabase MCP tools, but direct execution is not yet implemented. Future versions will support automatic insertion via MCP.

## Data Details

### Quiz Results (100 records)

- **Names**: Realistic Hungarian names (e.g., "Nagy Anna", "Kovács Péter", "Szabó Zsuzsanna")
- **Emails**: Generated as `firstname.lastname@provider.com` (gmail.com, freemail.hu, citromail.hu, etc.)
- **Ages**: 25-65 years, weighted toward 35-50 age range
- **Chakra Scores**: Realistic distributions (4-16 range per chakra, weighted toward middle values)
- **Answers**: 28-length arrays with values 1-4, weighted toward middle values (2 and 3)
- **Dates**: Distributed over last 90 days

### Purchases (30 records)

- **Product Distribution**:
  - 40% - Personal Chakra Report (4,990 HUF)
  - 25% - Chakra Handbook (5,990 HUF)
  - 15% - Chakra Meditations (7,990 HUF)
  - 20% - Full Harmony Bundle (14,990 HUF)

- **Status**: 90% completed, 10% pending
- **Stripe IDs**: Realistic fake Stripe session/payment intent IDs
- **Dates**: Created 1-60 minutes after associated quiz results
- **Foreign Keys**: Each purchase references a valid quiz_result

### Analytics Events (200 records)

- **Event Distribution**:
  - 40% - page_view
  - 20% - quiz_start
  - 15% - quiz_completed
  - 15% - checkout_initiated
  - 10% - purchase_completed

- **UTM Tracking**: 30% of events include UTM parameters (source, medium, campaign)
- **Session IDs**: Unique UUIDs for session tracking
- **Referrers**: Mix of Google, Facebook, Instagram, direct, YouTube, and null
- **IP Addresses**: Randomly generated IPv4 addresses

### Page Views (300 records)

- **Pages**: Home (/), Quiz (/kviz), Result (/eredmeny), Checkout (/checkout)
- **UTM Parameters**: 30% include marketing attribution data
- **Referrers**: Same distribution as analytics events
- **Session Tracking**: Unique session IDs for visitor analysis

## Data Characteristics

### Realistic Patterns

- **Age Distribution**: Bell curve centered on 35-50 years
- **Chakra Scores**: Normal distribution, avoiding extremes
- **Quiz Answers**: Weighted toward middle values (realistic human responses)
- **Purchase Timing**: Follows quiz completion (1-60 min delay)
- **Date Distribution**: Even spread across 90 days with random times

### Hungarian Localization

- Authentic Hungarian first and last names
- Common Hungarian email providers
- Hungarian product names and descriptions
- Realistic age demographics for Hungarian wellness market

## Script Configuration

You can modify data counts by editing the script's `COUNTS` object:

```typescript
const COUNTS = {
  QUIZ_RESULTS: 100,    // Number of quiz results
  PURCHASES: 30,        // Number of purchases
  ANALYTICS_EVENTS: 200,// Number of analytics events
  PAGE_VIEWS: 300,      // Number of page views
};
```

## Database Requirements

Ensure the following tables exist in your Supabase database:
- `quiz_results`
- `purchases`
- `analytics_events`
- `page_views`

Run all migrations before seeding:
- `003_purchases_meditation_tables.sql`
- `004_meditation_access_table.sql`
- `005_admin_analytics_tables.sql`

## Troubleshooting

### Script Errors

If you encounter errors during dry-run:
- Check that TypeScript types are correct
- Verify all dependencies are installed (`npm install`)
- Ensure `tsx` is available in node_modules

### Foreign Key Violations

If manual SQL execution fails with foreign key errors:
- Insert data in order: quiz_results → purchases → analytics_events/page_views
- Verify quiz_results are inserted before purchases

### Date Issues

All dates are generated in UTC timezone using ISO 8601 format. Supabase will handle timezone conversion automatically.

## Future Enhancements

Planned improvements:
- Direct Supabase MCP tool integration for automatic insertion
- Configurable data counts via CLI arguments
- Seed cleanup/reset script
- More granular event types
- Meditation access token generation
- Admin user seeding

## Security Notes

- This script is for **development/testing only**
- Do not run on production databases without review
- Fake Stripe IDs will not work with actual Stripe webhooks
- Generated emails are fake and should not be used for notifications

## Support

For issues or questions:
- Check the main project documentation
- Review Supabase schema files in `/docs/database-migrations/`
- Verify all migrations are applied before seeding

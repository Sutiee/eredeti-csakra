#!/usr/bin/env tsx
/**
 * Seed Test Data Script
 *
 * Generates realistic test data for the Eredeti Csakra admin dashboard.
 * This script creates fake quiz results, purchases, and analytics events
 * with realistic Hungarian names, dates, and patterns.
 *
 * Usage:
 *   npm run seed          # Execute seed data insertion
 *   npm run seed:dry      # Preview queries without execution
 */

import { randomUUID } from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_PROJECT_ID = 'zvoaqnfxschflsoqnusg';
const DRY_RUN = process.argv.includes('--dry-run');

const COUNTS = {
  QUIZ_RESULTS: 100,
  PURCHASES: 30,
  ANALYTICS_EVENTS: 200,
  PAGE_VIEWS: 300,
};

// ============================================================================
// Hungarian Names Data
// ============================================================================

const HUNGARIAN_FIRST_NAMES = {
  female: [
    'Anna', 'Katalin', 'Zsófia', 'Emma', 'Hanna', 'Luca', 'Léna', 'Maja',
    'Laura', 'Boglárka', 'Eszter', 'Réka', 'Petra', 'Dóra', 'Viktória',
    'Zsuzsanna', 'Ágnes', 'Klára', 'Júlia', 'Éva', 'Márta', 'Ildikó',
    'Andrea', 'Mónika', 'Krisztina', 'Beáta', 'Csilla', 'Erika',
  ],
  male: [
    'László', 'János', 'István', 'Péter', 'Gábor', 'Attila', 'Zoltán',
    'András', 'Tamás', 'Balázs', 'Dávid', 'Márk', 'Máté', 'Levente',
    'Bence', 'Ádám', 'Kristóf', 'Dominik', 'Richárd', 'Zsolt', 'Tibor',
  ],
};

const HUNGARIAN_LAST_NAMES = [
  'Nagy', 'Kovács', 'Tóth', 'Szabó', 'Horváth', 'Varga', 'Kiss',
  'Molnár', 'Németh', 'Farkas', 'Balogh', 'Papp', 'Takács', 'Juhász',
  'Lakatos', 'Mészáros', 'Oláh', 'Simon', 'Rácz', 'Fekete', 'Szilágyi',
  'Török', 'Fehér', 'Balázs', 'Gál', 'Kis', 'Szűcs', 'Kósa', 'Pintér',
];

// ============================================================================
// Product Data
// ============================================================================

const PRODUCTS = [
  {
    id: 'prod_personal_chakra_report',
    name: 'Személyre Szabott Csakra Jelentés',
    price: 4990,
    weight: 40, // 40% distribution
  },
  {
    id: 'prod_chakra_handbook',
    name: 'Csakra Kézikönyv',
    price: 5990,
    weight: 25, // 25% distribution
  },
  {
    id: 'prod_chakra_meditations',
    name: 'Csakra Meditációk',
    price: 7990,
    weight: 15, // 15% distribution
  },
  {
    id: 'prod_full_harmony_bundle',
    name: 'Teljes Harmónia Csomag',
    price: 14990,
    weight: 20, // 20% distribution
  },
];

// ============================================================================
// Analytics Event Types
// ============================================================================

const EVENT_TYPES = [
  { name: 'page_view', category: 'page', weight: 40 },
  { name: 'quiz_start', category: 'quiz', weight: 20 },
  { name: 'quiz_completed', category: 'quiz', weight: 15 },
  { name: 'checkout_initiated', category: 'checkout', weight: 15 },
  { name: 'purchase_completed', category: 'checkout', weight: 10 },
];

const REFERRERS = [
  'https://www.google.com',
  'https://www.facebook.com',
  'https://www.instagram.com',
  'direct',
  'https://www.youtube.com',
  null,
];

const UTM_SOURCES = ['google', 'facebook', 'instagram', 'email', 'direct'];
const UTM_MEDIUMS = ['cpc', 'social', 'organic', 'email', 'referral'];
const UTM_CAMPAIGNS = ['csakra-osz-2024', 'wellness-promo', 'meditation-launch', 'facebook-ads'];

// ============================================================================
// Chakra Names
// ============================================================================

const CHAKRA_NAMES = [
  'Gyökércsakra',
  'Szakrális csakra',
  'Napfonat csakra',
  'Szív csakra',
  'Torok csakra',
  'Harmadik szem csakra',
  'Korona csakra',
];

// ============================================================================
// Utility Functions
// ============================================================================

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function weightedRandomElement<T extends { weight: number }>(array: T[]): T {
  const totalWeight = array.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of array) {
    random -= item.weight;
    if (random <= 0) return item;
  }

  return array[array.length - 1];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateInLast90Days(): Date {
  const now = new Date();
  const daysAgo = randomInt(0, 90);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  // Add random hours/minutes
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date;
}

function generateHungarianName(): { firstName: string; lastName: string; fullName: string; email: string } {
  const isFemale = Math.random() > 0.5;
  const firstName = randomElement(
    isFemale ? HUNGARIAN_FIRST_NAMES.female : HUNGARIAN_FIRST_NAMES.male
  );
  const lastName = randomElement(HUNGARIAN_LAST_NAMES);
  const fullName = `${lastName} ${firstName}`;

  // Generate email: firstname.lastname@provider.com
  const emailProviders = ['gmail.com', 'freemail.hu', 'citromail.hu', 'outlook.com', 'yahoo.com'];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(emailProviders)}`;

  return { firstName, lastName, fullName, email };
}

function generateChakraScores(): Record<string, number> {
  const scores: Record<string, number> = {};

  // Generate realistic chakra scores (4-16 range, weighted toward middle)
  for (const chakraName of CHAKRA_NAMES) {
    // Use normal distribution centered around 10-12
    const base = randomInt(8, 14);
    const variance = randomInt(-2, 2);
    const score = Math.max(4, Math.min(16, base + variance));
    scores[chakraName] = score;
  }

  return scores;
}

function generateQuizAnswers(): number[] {
  // Generate 28 answers (4 questions per chakra, 7 chakras)
  const answers: number[] = [];

  for (let i = 0; i < 28; i++) {
    // Weighted toward middle values (2 and 3)
    const rand = Math.random();
    if (rand < 0.15) answers.push(1);
    else if (rand < 0.5) answers.push(2);
    else if (rand < 0.85) answers.push(3);
    else answers.push(4);
  }

  return answers;
}

function generateAge(): number {
  // Weighted distribution: 25-65, peak at 35-50
  const weights = [
    { min: 25, max: 30, weight: 10 },
    { min: 31, max: 40, weight: 30 },
    { min: 41, max: 50, weight: 30 },
    { min: 51, max: 60, weight: 20 },
    { min: 61, max: 65, weight: 10 },
  ];

  const range = weightedRandomElement(weights);
  return randomInt(range.min, range.max);
}

function generateFakeStripeId(prefix: 'cs' | 'pi'): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = `${prefix}_`;
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlDate(date: Date): string {
  return `'${date.toISOString()}'`;
}

// ============================================================================
// MCP Tool Mock (for dry-run mode)
// ============================================================================

async function executeSql(query: string): Promise<void> {
  if (DRY_RUN) {
    console.log('\n--- SQL QUERY ---');
    console.log(query);
    console.log('--- END ---\n');
    return;
  }

  // In production, this would use the actual MCP tool
  console.log('⚠️  MCP tool execution not available in script context.');
  console.log('Please copy the generated SQL queries and run them manually in Supabase SQL editor.');
  console.log('\nOr integrate this script with the MCP server for automatic execution.');
}

// ============================================================================
// Data Generation Functions
// ============================================================================

async function generateQuizResults(): Promise<Array<{ id: string; email: string; createdAt: Date }>> {
  console.log(`\n📊 Generating ${COUNTS.QUIZ_RESULTS} quiz results...`);

  const results: Array<{ id: string; email: string; createdAt: Date }> = [];
  const queries: string[] = [];

  for (let i = 0; i < COUNTS.QUIZ_RESULTS; i++) {
    const id = randomUUID();
    const { fullName, email } = generateHungarianName();
    const age = generateAge();
    const answers = generateQuizAnswers();
    const chakraScores = generateChakraScores();
    const createdAt = randomDateInLast90Days();

    results.push({ id, email, createdAt });

    const query = `
INSERT INTO quiz_results (id, name, email, age, answers, chakra_scores, created_at, updated_at)
VALUES (
  ${sqlString(id)},
  ${sqlString(fullName)},
  ${sqlString(email)},
  ${age},
  '${JSON.stringify(answers)}'::jsonb,
  '${JSON.stringify(chakraScores)}'::jsonb,
  ${sqlDate(createdAt)},
  ${sqlDate(createdAt)}
);`;

    queries.push(query);
  }

  // Execute in chunks of 10
  for (let i = 0; i < queries.length; i += 10) {
    const chunk = queries.slice(i, i + 10);
    const combinedQuery = chunk.join('\n');

    console.log(`  Inserting quiz results ${i + 1}-${Math.min(i + 10, queries.length)}...`);
    await executeSql(combinedQuery);
  }

  console.log(`✅ Generated ${COUNTS.QUIZ_RESULTS} quiz results`);
  return results;
}

async function generatePurchases(quizResults: Array<{ id: string; email: string; createdAt: Date }>): Promise<void> {
  console.log(`\n💳 Generating ${COUNTS.PURCHASES} purchases...`);

  const queries: string[] = [];

  for (let i = 0; i < COUNTS.PURCHASES; i++) {
    const result = randomElement(quizResults);
    const product = weightedRandomElement(PRODUCTS);
    const status = Math.random() < 0.9 ? 'completed' : 'pending';
    const createdAt = new Date(result.createdAt.getTime() + randomInt(60000, 3600000)); // 1-60 min after quiz

    const query = `
INSERT INTO purchases (id, result_id, email, product_id, product_name, amount, currency, stripe_session_id, stripe_payment_intent_id, status, created_at, updated_at)
VALUES (
  ${sqlString(randomUUID())},
  ${sqlString(result.id)},
  ${sqlString(result.email)},
  ${sqlString(product.id)},
  ${sqlString(product.name)},
  ${product.price},
  'HUF',
  ${sqlString(generateFakeStripeId('cs'))},
  ${status === 'completed' ? sqlString(generateFakeStripeId('pi')) : 'NULL'},
  ${sqlString(status)},
  ${sqlDate(createdAt)},
  ${sqlDate(createdAt)}
);`;

    queries.push(query);
  }

  // Execute in chunks of 10
  for (let i = 0; i < queries.length; i += 10) {
    const chunk = queries.slice(i, i + 10);
    const combinedQuery = chunk.join('\n');

    console.log(`  Inserting purchases ${i + 1}-${Math.min(i + 10, queries.length)}...`);
    await executeSql(combinedQuery);
  }

  console.log(`✅ Generated ${COUNTS.PURCHASES} purchases`);
}

async function generateAnalyticsEvents(quizResults: Array<{ id: string; email: string; createdAt: Date }>): Promise<void> {
  console.log(`\n📈 Generating ${COUNTS.ANALYTICS_EVENTS} analytics events...`);

  const queries: string[] = [];

  for (let i = 0; i < COUNTS.ANALYTICS_EVENTS; i++) {
    const eventType = weightedRandomElement(EVENT_TYPES);
    const result = Math.random() < 0.7 ? randomElement(quizResults) : null;
    const sessionId = randomUUID();
    const createdAt = result ? result.createdAt : randomDateInLast90Days();

    const eventData = {
      page: '/',
      ...(Math.random() < 0.3 && {
        utm_source: randomElement(UTM_SOURCES),
        utm_medium: randomElement(UTM_MEDIUMS),
        utm_campaign: randomElement(UTM_CAMPAIGNS),
      }),
    };

    const query = `
INSERT INTO analytics_events (id, event_name, event_category, event_data, session_id, result_id, ip_address, user_agent, page_path, referrer, created_at)
VALUES (
  ${sqlString(randomUUID())},
  ${sqlString(eventType.name)},
  ${sqlString(eventType.category)},
  '${JSON.stringify(eventData)}'::jsonb,
  ${sqlString(sessionId)},
  ${result ? sqlString(result.id) : 'NULL'},
  ${sqlString(`${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`)},
  ${sqlString('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')},
  '/',
  ${randomElement(REFERRERS) ? sqlString(randomElement(REFERRERS)!) : 'NULL'},
  ${sqlDate(createdAt)}
);`;

    queries.push(query);
  }

  // Execute in chunks of 10
  for (let i = 0; i < queries.length; i += 10) {
    const chunk = queries.slice(i, i + 10);
    const combinedQuery = chunk.join('\n');

    console.log(`  Inserting analytics events ${i + 1}-${Math.min(i + 10, queries.length)}...`);
    await executeSql(combinedQuery);
  }

  console.log(`✅ Generated ${COUNTS.ANALYTICS_EVENTS} analytics events`);
}

async function generatePageViews(): Promise<void> {
  console.log(`\n📄 Generating ${COUNTS.PAGE_VIEWS} page views...`);

  const queries: string[] = [];
  const pages = ['/', '/kviz', '/eredmeny', '/checkout'];

  for (let i = 0; i < COUNTS.PAGE_VIEWS; i++) {
    const sessionId = randomUUID();
    const pagePath = randomElement(pages);
    const createdAt = randomDateInLast90Days();

    const query = `
INSERT INTO page_views (id, page_path, page_title, session_id, ip_address, user_agent, referrer, utm_source, utm_medium, utm_campaign, created_at)
VALUES (
  ${sqlString(randomUUID())},
  ${sqlString(pagePath)},
  'Eredeti Csakra',
  ${sqlString(sessionId)},
  ${sqlString(`${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`)},
  ${sqlString('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')},
  ${randomElement(REFERRERS) ? sqlString(randomElement(REFERRERS)!) : 'NULL'},
  ${Math.random() < 0.3 ? sqlString(randomElement(UTM_SOURCES)) : 'NULL'},
  ${Math.random() < 0.3 ? sqlString(randomElement(UTM_MEDIUMS)) : 'NULL'},
  ${Math.random() < 0.3 ? sqlString(randomElement(UTM_CAMPAIGNS)) : 'NULL'},
  ${sqlDate(createdAt)}
);`;

    queries.push(query);
  }

  // Execute in chunks of 10
  for (let i = 0; i < queries.length; i += 10) {
    const chunk = queries.slice(i, i + 10);
    const combinedQuery = chunk.join('\n');

    console.log(`  Inserting page views ${i + 1}-${Math.min(i + 10, queries.length)}...`);
    await executeSql(combinedQuery);
  }

  console.log(`✅ Generated ${COUNTS.PAGE_VIEWS} page views`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main(): Promise<void> {
  console.log('🌱 Eredeti Csakra - Test Data Seed Script');
  console.log('=========================================\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No data will be inserted');
    console.log('SQL queries will be displayed for review\n');
  } else {
    console.log('⚠️  PRODUCTION MODE - Data will be inserted');
    console.log('Make sure you want to proceed!\n');
  }

  try {
    // Generate data in order (respecting foreign key constraints)
    const quizResults = await generateQuizResults();
    await generatePurchases(quizResults);
    await generateAnalyticsEvents(quizResults);
    await generatePageViews();

    console.log('\n🎉 Seed script completed successfully!');
    console.log('\nGenerated:');
    console.log(`  - ${COUNTS.QUIZ_RESULTS} quiz results`);
    console.log(`  - ${COUNTS.PURCHASES} purchases`);
    console.log(`  - ${COUNTS.ANALYTICS_EVENTS} analytics events`);
    console.log(`  - ${COUNTS.PAGE_VIEWS} page views`);

    if (DRY_RUN) {
      console.log('\n💡 To execute the queries, run: npm run seed');
    } else {
      console.log('\n⚠️  Note: MCP tool integration needed for automatic execution.');
      console.log('Copy the generated SQL queries and run them in Supabase SQL editor.');
    }

  } catch (error) {
    console.error('\n❌ Error during seed execution:', error);
    process.exit(1);
  }
}

// Run the script
main();

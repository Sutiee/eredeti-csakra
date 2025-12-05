-- Create newsletter_campaigns table
create table if not exists public.newsletter_campaigns (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  html_content text,
  status text default 'draft' check (status in ('draft', 'processing', 'completed', 'failed')),
  total_recipients integer default 0,
  sent_count integer default 0,
  failed_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create newsletter_recipients table
create table if not exists public.newsletter_recipients (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.newsletter_campaigns(id) on delete cascade,
  email text not null,
  name text,
  status text default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_recipients enable row level security;

-- Create policies (allow all for authenticated admins - assuming admin uses authenticated role or we just allow public for this internal tool if auth is handled by middleware? 
-- The user said "simple password". The middleware protects the route. The API route runs on the server.
-- The API route uses `supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` usually for admin tasks.
-- If we use Service Role Key, RLS is bypassed.
-- But if we use the client side to read stats, we might need policies.
-- Let's add basic policies for authenticated users just in case.

create policy "Enable read access for authenticated users"
  on public.newsletter_campaigns for select
  using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users"
  on public.newsletter_campaigns for insert
  with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users"
  on public.newsletter_campaigns for update
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.newsletter_recipients for select
  using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users"
  on public.newsletter_recipients for insert
  with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users"
  on public.newsletter_recipients for update
  using (auth.role() = 'authenticated');

-- Indexes
create index if not exists idx_newsletter_recipients_campaign_id on public.newsletter_recipients(campaign_id);
create index if not exists idx_newsletter_recipients_status on public.newsletter_recipients(status);

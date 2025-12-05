-- Create newsletter_unsubscribes table
create table if not exists public.newsletter_unsubscribes (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.newsletter_unsubscribes enable row level security;

-- Policies
-- Allow public insert (anyone can unsubscribe themselves) - potentially rate limited by API
create policy "Enable insert for public"
  on public.newsletter_unsubscribes for insert
  with check (true);

-- Allow admin read
create policy "Enable read for authenticated users"
  on public.newsletter_unsubscribes for select
  using (auth.role() = 'authenticated');

-- Allow service role full access (default)

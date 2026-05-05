-- Users table (extended from auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  username text not null unique,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.users enable row level security;
create policy "Users can view all profiles" on public.users for select using (true);
create policy "Users can manage their own profile" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);

-- Restaurants table
create table if not exists public.restaurants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  city text,
  country text,
  latitude double precision,
  longitude double precision,
  google_place_id text,
  cuisine_type text,
  price_range integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.restaurants enable row level security;
create policy "Anyone can view restaurants" on public.restaurants for select using (true);
create policy "Authenticated users can insert restaurants" on public.restaurants for insert with check (auth.role() = 'authenticated');

-- Posts table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  restaurant_id uuid references public.restaurants on delete set null,
  caption text,
  rating integer check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create policy "Anyone can view posts" on public.posts for select using (true);
create policy "Users can manage their own posts" on public.posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Post photos table
create table if not exists public.post_photos (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  url text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.post_photos enable row level security;
create policy "Anyone can view post photos" on public.post_photos for select using (true);
create policy "Users can manage photos for their posts" on public.post_photos for all
  using (auth.uid() = (select user_id from public.posts where id = post_id))
  with check (auth.uid() = (select user_id from public.posts where id = post_id));

-- Hashtags table
create table if not exists public.hashtags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);
alter table public.hashtags enable row level security;
create policy "Anyone can view hashtags" on public.hashtags for select using (true);
create policy "Authenticated users can insert hashtags" on public.hashtags for insert with check (auth.role() = 'authenticated');

-- Post hashtags join table
create table if not exists public.post_hashtags (
  post_id uuid references public.posts on delete cascade,
  hashtag_id uuid references public.hashtags on delete cascade,
  primary key (post_id, hashtag_id)
);
alter table public.post_hashtags enable row level security;
create policy "Anyone can view post hashtags" on public.post_hashtags for select using (true);
create policy "Users can manage hashtags for their posts" on public.post_hashtags for all
  using (auth.uid() = (select user_id from public.posts where id = post_id))
  with check (auth.uid() = (select user_id from public.posts where id = post_id));

-- Likes table
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  post_id uuid references public.posts on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);
alter table public.likes enable row level security;
create policy "Anyone can view likes" on public.likes for select using (true);
create policy "Users can manage their own likes" on public.likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Saves table
create table if not exists public.saves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  post_id uuid references public.posts on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);
alter table public.saves enable row level security;
create policy "Users can view their own saves" on public.saves for select using (auth.uid() = user_id);
create policy "Users can manage their own saves" on public.saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Follows table
create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.users on delete cascade not null,
  following_id uuid references public.users on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id)
);
alter table public.follows enable row level security;
create policy "Anyone can view follows" on public.follows for select using (true);
create policy "Users can manage their own follows" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- Comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  post_id uuid references public.posts on delete cascade not null,
  parent_comment_id uuid references public.comments on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.comments enable row level security;
create policy "Anyone can view comments" on public.comments for select using (true);
create policy "Users can manage their own comments" on public.comments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User settings table
create table if not exists public.user_settings (
  id uuid references auth.users on delete cascade primary key,
  notif_likes boolean not null default true,
  notif_comments boolean not null default true,
  notif_followers boolean not null default true,
  notif_mentions boolean not null default true,
  private_account boolean not null default false,
  allow_comments boolean not null default true,
  allow_tags boolean not null default true,
  dark_mode boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
create policy "Users can manage their own settings" on public.user_settings for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- Storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
create policy "Anyone can view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Authenticated users can upload avatars" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can update their own avatars" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete their own avatars" on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

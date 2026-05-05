-- Seed mock creators into auth.users (local dev only)
insert into auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sarahleats@seed.invalid',   '', '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'melfoods@seed.invalid',     '', '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jkitchen@seed.invalid',     '', '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tomreview@seed.invalid',    '', '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'foodwithfinn@seed.invalid', '', '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', now(), now())
on conflict (id) do nothing;

-- Seed mock creators into public.users
insert into public.users (id, username, full_name) values
  ('00000000-0000-0000-0000-000000000001', 'sarahleats',   'Sarah Lee'),
  ('00000000-0000-0000-0000-000000000002', 'melfoods',     'Mel Foods'),
  ('00000000-0000-0000-0000-000000000003', 'jkitchen',     'J Kitchen'),
  ('00000000-0000-0000-0000-000000000004', 'tomreview',    'Tom Review'),
  ('00000000-0000-0000-0000-000000000005', 'foodwithfinn', 'Finn Food')
on conflict (id) do nothing;

-- Seed 6 mock posts with fixed UUIDs
insert into public.posts (id, user_id, caption, rating) values
  ('11000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Best tonkotsu ramen in Sydney — thick broth, melt-in-mouth chashu', 5),
  ('11000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Hidden gem dumpling spot in Haymarket — $12 for 20 pieces', 5),
  ('11000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Date night done right — Surry Hills Italian that won''t break the bank', 4),
  ('11000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Smash burger that actually slaps — Newtown''s best kept secret', 5),
  ('11000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Melbourne''s best omakase for under $100 — book months ahead', 5),
  ('11000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Sydney brunch spot with zero wait — and the eggs benny are elite', 4)
on conflict (id) do nothing;

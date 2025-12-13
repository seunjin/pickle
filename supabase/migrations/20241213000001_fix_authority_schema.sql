-- Fix authority column schema
-- 1. Update existing 'member' authority to NULL (since 'member' is a State, not Authority)
update profiles set authority = null where authority = 'member';

-- 2. Drop the incorrect check constraint
alter table profiles drop constraint if exists profiles_authority_check;

-- 3. Add correct check constraint (only super_admin, admin allowed)
alter table profiles add constraint profiles_authority_check check (authority in ('super_admin', 'admin'));

-- 4. Update the trigger function to insert NULL for authority by default
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, authority, state)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    null, -- Authority should be null for regular users
    'member'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

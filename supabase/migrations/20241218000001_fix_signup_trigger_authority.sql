-- Fix handle_new_user trigger to respect authority check constraint
-- The constraint profiles_authority_check (now on users) requires authority to be 'super_admin', 'admin', or NULL.
-- Regular users should have NULL authority.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, full_name, avatar_url, email, authority, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    null, -- Authority must be null for regular members (check constraint)
    'pending' -- default status
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

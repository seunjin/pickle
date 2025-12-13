-- Add missing columns to notes table to match contract
alter table notes 
add column if not exists url text not null default '',
add column if not exists content text,
add column if not exists tags text[] default array[]::text[];

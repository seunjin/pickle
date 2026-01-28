-- Create legal_document_type enum if not exists
do $$
begin
  if not exists (select 1 from pg_type where typname = 'legal_document_type') then
    create type legal_document_type as enum ('service', 'privacy', 'marketing');
  end if;
end $$;

-- Create legal_documents table
create table if not exists legal_documents (
  id uuid primary key default gen_random_uuid(),
  type legal_document_type not null,
  version text not null,
  title text not null,
  content text not null,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id)
);

-- Index for fast lookup of active versions
create index if not exists idx_legal_docs_active on legal_documents (type) where (is_active = true);

-- Constraint: Only one active version per type
create unique index if not exists idx_only_one_active_per_type on legal_documents (type) where (is_active = true);

-- Enable RLS
alter table legal_documents enable row level security;

-- Policies
do $$
begin
  -- Select policy: Active documents for everyone, all documents for admins
  if not exists (select from pg_policies where policyname = 'Allow select active to all, all to admins' and tablename = 'legal_documents') then
    create policy "Allow select active to all, all to admins" on legal_documents 
    for select using (
      (is_active = true) 
      or 
      (exists (select 1 from public.users where id = auth.uid() and authority in ('super_admin', 'admin')))
    );
  end if;

  -- Admin policy: All operations for admins
  if not exists (select from pg_policies where policyname = 'Admins can perform all operations' and tablename = 'legal_documents') then
    create policy "Admins can perform all operations" on legal_documents
    for all using (
      exists (select 1 from public.users where id = auth.uid() and authority in ('super_admin', 'admin'))
    );
  end if;
end $$;

-- Initial data (Placeholders)
insert into legal_documents (type, version, title, content, is_active)
values 
  ('service', '1.0.0', '이용약관', '# 이용약관\n\n내용을 입력해주세요.', true),
  ('privacy', '1.0.0', '개인정보처리방침', '# 개인정보처리방침\n\n내용을 입력해주세요.', true),
  ('marketing', '1.0.0', '마케팅 수신 동의', '# 마케팅 수신 동의\n\n내용을 입력해주세요.', true)
on conflict do nothing;

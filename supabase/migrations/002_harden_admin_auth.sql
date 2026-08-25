-- Apply this migration to projects that already ran 001_initial.sql.
-- Only the exact `admin` role may mutate CMS and CRM data.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

drop policy if exists "settings public read" on public.settings;

-- Recreate self-profile read explicitly. This lets a signed-in user prove their
-- own role without exposing other administrator accounts.
drop policy if exists "profile self read" on public.profiles;
create policy "profile self read"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- The inquiry bucket must stay private; access is granted only through the
-- authenticated administrator policy below.
update storage.buckets
set public = false,
    file_size_limit = 8388608,
    allowed_mime_types = array['application/pdf','image/jpeg','image/png']
where id = 'inquiry-attachments';

drop policy if exists "admins read inquiry files" on storage.objects;
create policy "admins read inquiry files"
on storage.objects
for select
to authenticated
using (bucket_id = 'inquiry-attachments' and public.is_admin());

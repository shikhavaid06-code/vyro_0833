-- ✅ Real public stats RPC — powers /api/stats (real creator/generation
-- counts instead of fabricated numbers).
-- Safe to re-run: CREATE OR REPLACE is idempotent.

create or replace function public.get_public_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'total_creators', (select count(*)::int from public.profiles),
    'total_generated', (select coalesce(sum(gen_count), 0)::int from public.profiles)
  );
$$;

grant execute on function public.get_public_stats() to anon, authenticated;

import { supabase } from '@/lib/supabase';
import { formatSupabaseError } from '@/lib/supabase-errors';
import type {
  Platform,
  PlatformInsert,
  PlatformUpdate,
  Section,
  SectionInsert,
  SectionUpdate,
  SectionWithStats,
  Tutorial,
  TutorialInsert,
  TutorialUpdate,
} from '@/lib/database.types';

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

// ——— Public (mobile) ———

export async function fetchPublishedPlatforms(): Promise<Platform[]> {
  const { data, error } = await requireClient()
    .from('platforms')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPublishedPlatformBySlug(slug: string): Promise<Platform | null> {
  const { data, error } = await requireClient()
    .from('platforms')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchPublishedSectionsWithStats(
  platformSlug: string,
): Promise<SectionWithStats[]> {
  const { data: platform, error: pErr } = await requireClient()
    .from('platforms')
    .select('id')
    .eq('slug', platformSlug)
    .eq('is_published', true)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!platform) return [];

  const { data: sections, error: sErr } = await requireClient()
    .from('sections')
    .select('*')
    .eq('platform_id', platform.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (sErr) throw sErr;
  if (!sections?.length) return [];

  const sectionIds = sections.map((s) => s.id);
  const { data: tutorials, error: tErr } = await requireClient()
    .from('tutorials')
    .select('section_id, type')
    .in('section_id', sectionIds)
    .eq('is_published', true);
  if (tErr) throw tErr;

  const counts = new Map<string, { video: number; doc: number }>();
  for (const id of sectionIds) counts.set(id, { video: 0, doc: 0 });
  for (const t of tutorials ?? []) {
    const c = counts.get(t.section_id)!;
    if (t.type === 'video') c.video++;
    else c.doc++;
  }

  return sections.map((s) => ({
    ...s,
    video_count: counts.get(s.id)?.video ?? 0,
    doc_count: counts.get(s.id)?.doc ?? 0,
  }));
}

export async function fetchPublishedTutorials(sectionId: string): Promise<Tutorial[]> {
  const { data, error } = await requireClient()
    .from('tutorials')
    .select('*')
    .eq('section_id', sectionId)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchRecentPublishedTutorials(limit = 5): Promise<Tutorial[]> {
  const { data, error } = await requireClient()
    .from('tutorials')
    .select('*, sections(name, slug, platforms(name, slug))')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Tutorial[];
}

// ——— Admin ———

export async function ensureAdminAccess(): Promise<void> {
  const client = requireClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;

  const { count, error: countErr } = await client
    .from('admin_users')
    .select('*', { count: 'exact', head: true });
  if (countErr) throw countErr;

  if (count === 0) {
    const { error } = await client.from('admin_users').insert({ user_id: user.id });
    if (error && error.code !== '23505') {
      throw new Error(formatSupabaseError(error));
    }
  }

  const { data: adminRow, error: verifyErr } = await client
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (verifyErr) throw new Error(formatSupabaseError(verifyErr));
  if (!adminRow) {
    throw new Error(
      'Your account is not an admin. In Supabase SQL Editor, run supabase/bootstrap-admin.sql with your user UUID from Authentication → Users.',
    );
  }
}

export async function fetchAllPlatforms(): Promise<Platform[]> {
  const { data, error } = await requireClient()
    .from('platforms')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createPlatform(row: PlatformInsert): Promise<Platform> {
  const { data, error } = await requireClient().from('platforms').insert(row).select().single();
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

export async function updatePlatform(id: string, row: PlatformUpdate): Promise<Platform> {
  const { data, error } = await requireClient()
    .from('platforms')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

export async function deletePlatform(id: string): Promise<void> {
  const { error } = await requireClient().from('platforms').delete().eq('id', id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function fetchAllSections(platformId?: string): Promise<Section[]> {
  let query = requireClient()
    .from('sections')
    .select('*, platforms(slug, name)')
    .order('sort_order', { ascending: true });
  if (platformId) query = query.eq('platform_id', platformId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createSection(row: SectionInsert): Promise<Section> {
  const { data, error } = await requireClient().from('sections').insert(row).select().single();
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

export async function updateSection(id: string, row: SectionUpdate): Promise<Section> {
  const { data, error } = await requireClient()
    .from('sections')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

export async function deleteSection(id: string): Promise<void> {
  const { error } = await requireClient().from('sections').delete().eq('id', id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function fetchAllTutorials(sectionId?: string): Promise<Tutorial[]> {
  let query = requireClient()
    .from('tutorials')
    .select('*, sections(name, slug, platforms(name, slug))')
    .order('sort_order', { ascending: true });
  if (sectionId) query = query.eq('section_id', sectionId);
  const { data, error } = await query;
  if (error) throw new Error(formatSupabaseError(error));
  return (data ?? []) as Tutorial[];
}

export async function createTutorial(row: TutorialInsert): Promise<Tutorial> {
  const { data, error } = await requireClient().from('tutorials').insert(row).select().single();
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

export async function updateTutorial(id: string, row: TutorialUpdate): Promise<Tutorial> {
  const { data, error } = await requireClient()
    .from('tutorials')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

export async function deleteTutorial(id: string): Promise<void> {
  const { error } = await requireClient().from('tutorials').delete().eq('id', id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function fetchDashboardStats() {
  const client = requireClient();
  const [platforms, sections, tutorials] = await Promise.all([
    client.from('platforms').select('*', { count: 'exact', head: true }),
    client.from('sections').select('*', { count: 'exact', head: true }),
    client.from('tutorials').select('*', { count: 'exact', head: true }),
  ]);
  if (platforms.error) throw platforms.error;
  if (sections.error) throw sections.error;
  if (tutorials.error) throw tutorials.error;
  return {
    platforms: platforms.count ?? 0,
    sections: sections.count ?? 0,
    tutorials: tutorials.count ?? 0,
  };
}

export type TutorialType = 'video' | 'document';

export interface Platform {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  emoji: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  platform_id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string;
  bg_color: string;
  icon: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  platforms?: Pick<Platform, 'slug' | 'name'>;
}

export interface SectionWithStats extends Section {
  video_count: number;
  doc_count: number;
}

export interface Tutorial {
  id: string;
  section_id: string;
  type: TutorialType;
  title: string;
  description: string | null;
  video_url: string | null;
  poster_url: string | null;
  duration: string | null;
  document_url: string | null;
  file_type: string | null;
  file_size: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  published_at: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  sections?: Pick<Section, 'name' | 'slug'> & {
    platforms?: Pick<Platform, 'name' | 'slug'>;
  };
}

export type PlatformInsert = Pick<
  Platform,
  'slug' | 'name' | 'subtitle' | 'emoji' | 'sort_order' | 'is_published'
>;
export type PlatformUpdate = Partial<PlatformInsert>;

export type SectionInsert = Pick<
  Section,
  | 'platform_id'
  | 'slug'
  | 'name'
  | 'description'
  | 'color'
  | 'bg_color'
  | 'icon'
  | 'sort_order'
  | 'is_published'
>;
export type SectionUpdate = Partial<SectionInsert>;

export type TutorialInsert = {
  section_id: string;
  type: TutorialType;
  title: string;
  description?: string | null;
  video_url?: string | null;
  poster_url?: string | null;
  duration?: string | null;
  document_url?: string | null;
  file_type?: string | null;
  file_size?: string | null;
  published_at?: string | null;
  sort_order?: number;
  is_published?: boolean;
};
export type TutorialUpdate = Partial<TutorialInsert>;

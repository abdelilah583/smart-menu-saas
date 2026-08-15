export interface Cafe {
  id: string;
  slug: string;
  name: string | null;
  logo_url?: string | null;
  reviews_url?: string | null;
  instagram_url?: string | null;
  maps_url?: string | null;
}

export interface MenuSection {
  id: string;
  cafe_id: string;
  display_order: number;
  image_url?: string | null;
  name?: string | null;
  name_ar?: string | null;
  name_fr?: string | null;
  name_en?: string | null;
}

export interface Dish {
  id: string;
  section_id: string;
  display_order: number;
  is_available: boolean;
  price: number;
  image_url?: string | null;
  name?: string | null;
  name_ar?: string | null;
  name_fr?: string | null;
  name_en?: string | null;
  description?: string | null;
  description_ar?: string | null;
  description_fr?: string | null;
  description_en?: string | null;
  // اختياري: فقط لو كان عندكم تقييمات حقيقية في القاعدة
  rating_avg?: number | null;
  rating_count?: number | null;
}

export type Lang = 'ar' | 'fr' | 'en';

export const LANG_FLAG_CODE: Record<Lang, string> = {
  ar: 'SA',
  fr: 'FR',
  en: 'GB',
};
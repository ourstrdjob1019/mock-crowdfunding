import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * 썸네일 이미지를 Supabase Storage (project-thumbnails)에 업로드
 */
export async function uploadThumbnail(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) {
    return { url: null, error: "Supabase 환경변수가 설정되지 않았습니다." };
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `thumb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("project-thumbnails")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from("project-thumbnails")
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || "파일 업로드 중 오류 발생" };
  }
}

/**
 * 랜딩페이지 파일(이미지/PDF/HTML)을 Supabase Storage (landing-files)에 업로드
 */
export async function uploadLandingFile(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) {
    return { url: null, error: "Supabase 환경변수가 설정되지 않았습니다." };
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `landing_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `files/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("landing-files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from("landing-files")
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || "파일 업로드 중 오류 발생" };
  }
}

import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * 파일 확장자 안전 정규화 (한글/특수문자/공백 제거 및 소문자화)
 */
function sanitizeExt(fileName: string, fallback: string = "bin"): string {
  const parts = fileName.split(".");
  if (parts.length <= 1) return fallback;
  const rawExt = parts.pop() || "";
  const cleaned = rawExt.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return cleaned || fallback;
}

/**
 * 썸네일 이미지를 Supabase Storage (project-thumbnails)에 업로드
 */
export async function uploadThumbnail(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) {
    return { url: null, error: "Supabase 환경변수가 설정되지 않았습니다." };
  }

  // 20MB 제한
  if (file.size > 20 * 1024 * 1024) {
    return { url: null, error: "썸네일 이미지 크기는 20MB 이하만 업로드 가능합니다." };
  }

  try {
    const fileExt = sanitizeExt(file.name, "jpg");
    const fileName = `thumb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("project-thumbnails")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Supabase thumbnail upload error:", uploadError);
      return { url: null, error: `업로드 실패: ${uploadError.message}` };
    }

    const { data } = supabase.storage
      .from("project-thumbnails")
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    console.error("uploadThumbnail exception:", err);
    return { url: null, error: err.message || "파일 업로드 중 오류가 발생했습니다." };
  }
}

/**
 * 랜딩페이지 파일(이미지/PDF/HTML/동영상)을 Supabase Storage (landing-files)에 업로드
 */
export async function uploadLandingFile(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) {
    return { url: null, error: "Supabase 환경변수가 설정되지 않았습니다." };
  }

  // 150MB 제한
  if (file.size > 150 * 1024 * 1024) {
    return { url: null, error: "출품 파일 크기는 150MB 이하만 업로드 가능합니다." };
  }

  try {
    const fileExt = sanitizeExt(file.name, "bin");
    const fileName = `landing_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `files/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("landing-files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Supabase landing file upload error:", uploadError);
      return { url: null, error: `파일 저장 실패: ${uploadError.message}` };
    }

    const { data } = supabase.storage
      .from("landing-files")
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    console.error("uploadLandingFile exception:", err);
    return { url: null, error: err.message || "파일 업로드 중 오류가 발생했습니다." };
  }
}

"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadPhoto(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("File tidak ditemukan.");

    const randomFolder = Math.random().toString(36).substring(2, 10);
    const randomName = Math.random().toString(36).substring(2, 10);
    const fileName = `${randomName}-${Date.now()}.webp`;
    const filePath = `family-photos/${randomFolder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("photos")
      .upload(filePath, file, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("photos")
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("Upload process error:", error);
    return { success: false, error: error.message || "Gagal mengunggah foto." };
  }
}

export async function deletePhoto(url: string) {
  try {
    if (!url || !url.includes("storage/v1/object/public/photos/")) return;

    // Extract path from public URL
    // URL usually looks like: https://[ID].supabase.co/storage/v1/object/public/photos/family-photos/folder/file.webp
    const path = url.split("/photos/")[1];
    if (!path) return;

    const { error } = await supabase.storage
      .from("photos")
      .remove([path]);

    if (error) console.error("Error deleting old photo:", error);
    return { success: !error };
  } catch (error) {
    console.error("Exception in deletePhoto:", error);
    return { success: false };
  }
}

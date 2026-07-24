import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

const isMockStorage = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('tu-proyecto');

/**
 * Comprime un archivo de imagen en el cliente.
 * Límite estricto de 0.5 MB (maxSizeMB: 0.5) y 1200px de resolución máxima.
 */
export async function compressImage(file: File): Promise<File> {
  // Solo comprimimos si es una imagen
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  try {
    console.log(`[Compresión] Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    const compressedBlob = await imageCompression(file, options);
    
    // Convertir de vuelta a File manteniendo el nombre y tipo original
    const compressedFile = new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
    
    console.log(`[Compresión] Tamaño final: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    return compressedFile;
  } catch (error) {
    console.error('[Compresión] Error al comprimir la imagen:', error);
    // Devolvemos el archivo original si falla la compresión
    return file;
  }
}

/**
 * Comprime y sube una imagen a Supabase Storage.
 * Si las credenciales de Supabase no están configuradas, simula la carga y guarda el resultado de manera local (Mock).
 */
export async function uploadImageToSupabase(
  bucket: string,
  path: string,
  file: File
): Promise<{ publicUrl: string | null; error: any }> {
  try {
    // 1. Comprimir en el cliente
    const compressedFile = await compressImage(file);

    // 2. Subida real o simulada
    if (isMockStorage) {
      console.log(`[Storage Mock] Subida simulada al bucket '${bucket}' en la ruta '${path}'`);
      
      // Simular tiempo de carga de red (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Leer el archivo comprimido como base64 Data URL para usarlo en la app local
      const reader = new FileReader();
      const mockUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Error al leer el archivo en base64'));
        reader.readAsDataURL(compressedFile);
      });

      return { publicUrl: mockUrl, error: null };
    }

    // Subida real a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, compressedFile, {
        upsert: true,
      });

    if (error) {
      console.error('[Storage] Error al subir el archivo:', error);
      return { publicUrl: null, error };
    }

    // Obtener la URL pública del archivo subido
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { publicUrl: urlData.publicUrl, error: null };
  } catch (err: any) {
    console.error('[Storage] Error crítico en uploadImageToSupabase:', err);
    return { publicUrl: null, error: err };
  }
}

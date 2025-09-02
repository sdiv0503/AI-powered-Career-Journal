import { createClient } from '@supabase/supabase-js';

// Use service role key (full access, bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Admin key
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, fileName, fileData } = req.body;
    
    // Server-side upload with admin privileges
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, fileData, {
        cacheControl: '3600'
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    res.json({
      success: true,
      downloadURL: publicUrl.publicUrl,
      storagePath: filePath
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

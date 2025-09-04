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
    const { userId, fileName, fileData, metadata } = req.body;
    
    console.log(`📤 Server-side upload starting for: ${fileName}`);
    
    // Server-side upload with admin privileges
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, fileData, {
        cacheControl: '3600',
        upsert: false // Prevent overwriting
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      throw error;
    }

    const { data: publicUrl } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    console.log(`✅ File uploaded successfully: ${filePath}`);

    // 🎯 If metadata includes extracted text, log it for verification
    if (metadata?.extractedText) {
      console.log(`📄 Resume text extracted: ${metadata.extractedText.length} characters`);
      console.log(`👤 Contact info: ${JSON.stringify(metadata.contactInfo || {})}`);
    }

    // 🎯 Enhanced response with text verification
    const response = {
      success: true,
      downloadURL: publicUrl.publicUrl,
      storagePath: filePath,
      uploadedAt: new Date().toISOString(),
      
      // Include metadata verification
      textExtracted: !!(metadata?.extractedText),
      textLength: metadata?.extractedText?.length || 0,
      contactFields: metadata?.contactInfo ? Object.keys(metadata.contactInfo).length : 0
    };

    console.log(`📊 Upload response:`, {
      fileName,
      textLength: response.textLength,
      contactFields: response.contactFields
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Upload handler error:', error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

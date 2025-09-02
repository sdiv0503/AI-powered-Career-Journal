import { supabase } from '../lib/supabase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Upload resume file to Supabase Storage
export const uploadResumeToSupabase = async (userId, file, onProgress) => {
  try {
    // Create unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    const filePath = `${userId}/${fileName}`;

    console.log(`📤 Uploading to Supabase: ${filePath}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      throw new Error(error.message);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    console.log('✅ Upload completed!');

    // Simulate progress for UI (since Supabase doesn't provide real-time progress)
    if (onProgress) {
      onProgress(25);
      setTimeout(() => onProgress(50), 100);
      setTimeout(() => onProgress(75), 200);
      setTimeout(() => onProgress(100), 300);
    }

    return {
      downloadURL: publicUrlData.publicUrl,
      storagePath: filePath,
      fileName: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('❌ Error uploading to Supabase:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Save resume metadata to Firestore (unchanged)
export const saveResumeMetadata = async (userId, metadata) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', metadata.id.toString());
    
    const resumeDoc = {
      ...metadata,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1
    };

    await setDoc(docRef, resumeDoc);
    console.log('✅ Resume metadata saved to Firestore');
    
    return resumeDoc;
  } catch (error) {
    console.error('❌ Error saving resume metadata:', error);
    throw new Error('Failed to save resume metadata');
  }
};

// Get all user's resumes (unchanged)
export const getUserResumes = async (userId) => {
  try {
    const resumesRef = collection(db, 'users', userId, 'resumes');
    const q = query(resumesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const resumes = [];
    querySnapshot.forEach((doc) => {
      resumes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📋 Retrieved ${resumes.length} resumes for user`);
    return resumes;
  } catch (error) {
    console.error('❌ Error getting user resumes:', error);
    throw new Error('Failed to retrieve resumes');
  }
};

// Get specific resume (unchanged)
export const getResumeById = async (userId, resumeId) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Resume not found');
    }
  } catch (error) {
    console.error('❌ Error getting resume:', error);
    throw error;
  }
};

// Delete resume (file from Supabase + metadata from Firestore)
export const deleteResume = async (userId, resumeId, storagePath) => {
  try {
    // Delete from Supabase Storage
    if (storagePath) {
      const { error } = await supabase.storage
        .from('resumes')
        .remove([storagePath]);
        
      if (error) {
        console.error('❌ Error deleting from Supabase:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
      }
      
      console.log('✅ Resume file deleted from Supabase storage');
    }

    // Delete metadata from Firestore
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    await deleteDoc(docRef);
    console.log('✅ Resume metadata deleted from Firestore');
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting resume:', error);
    throw new Error('Failed to delete resume');
  }
};

// Backward compatibility alias
export const uploadResumeToFirebase = uploadResumeToSupabase;

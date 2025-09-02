import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadResumeToSupabase, saveResumeMetadata, deleteResume } from '../services/resumeService';
import toast from 'react-hot-toast';

// ✅ NAMED EXPORT - This is what fixes the error
export const useResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedResumes, setUploadedResumes] = useState([]);
  
  const { currentUser } = useAuth();

  const uploadResumes = useCallback(async (filesWithMetadata) => {
    if (!currentUser) {
      toast.error('Please log in to upload resumes');
      return;
    }

    setUploading(true);
    const results = [];

    try {
      for (const fileData of filesWithMetadata) {
        console.log(`📤 Starting upload for: ${fileData.name}`);
        
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: { status: 'uploading', progress: 0 }
        }));

        try {
          const uploadResult = await uploadResumeToSupabase(
            currentUser.uid,
            fileData.file,
            (progress) => {
              setUploadProgress(prev => ({
                ...prev,
                [fileData.id]: { status: 'uploading', progress }
              }));
            }
          );

          const resumeMetadata = {
            id: fileData.id,
            fileName: fileData.name,
            fileSize: fileData.size,
            uploadedAt: fileData.uploadedAt,
            downloadURL: uploadResult.downloadURL,
            storagePath: uploadResult.storagePath,
            userId: currentUser.uid,
            status: 'uploaded',
            parsed: false
          };

          await saveResumeMetadata(currentUser.uid, resumeMetadata);

          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: { status: 'completed', progress: 100 }
          }));

          results.push({
            ...fileData,
            ...resumeMetadata,
            uploadResult
          });

          console.log(`✅ Upload completed for: ${fileData.name}`);

        } catch (fileError) {
          console.error(`❌ Upload failed for ${fileData.name}:`, fileError);
          
          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: { status: 'error', progress: 0, error: fileError.message }
          }));

          toast.error(`Failed to upload ${fileData.name}: ${fileError.message}`);
        }
      }

      setUploadedResumes(prev => [...prev, ...results]);
      
      if (results.length > 0) {
        toast.success(`Successfully uploaded ${results.length} resume(s)!`);
      }

      return results;

    } catch (error) {
      console.error('❌ Bulk upload error:', error);
      toast.error('Failed to upload resumes. Please try again.');
      throw error;
    } finally {
      setUploading(false);
    }
  }, [currentUser]);

  const removeResume = useCallback(async (resumeId) => {
    try {
      const resumeToDelete = uploadedResumes.find(resume => resume.id === resumeId);
      
      if (resumeToDelete) {
        await deleteResume(currentUser.uid, resumeId, resumeToDelete.storagePath);
      }
      
      setUploadedResumes(prev => prev.filter(resume => resume.id !== resumeId));
      setUploadProgress(prev => {
        const { [resumeId]: removed, ...rest } = prev;
        return rest;
      });
      
      toast.success('Resume removed successfully');
    } catch (error) {
      console.error('❌ Remove resume error:', error);
      toast.error('Failed to remove resume');
    }
  }, [currentUser, uploadedResumes]);

  return {
    uploading,
    uploadProgress,
    uploadedResumes,
    uploadResumes,
    removeResume,
    setUploadedResumes
  };
};

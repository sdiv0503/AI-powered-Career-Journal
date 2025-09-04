import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadResumeToSupabase, saveResumeMetadata, deleteResume } from '../services/resumeService';
import { enhancedPdfParser } from '../utils/pdfParser'; // Import your PDF parser
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
          // 🔍 Step 1: Parse PDF to extract text BEFORE uploading
          console.log(`📄 Parsing PDF: ${fileData.name}`);
          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: { status: 'parsing', progress: 10 }
          }));

          let parsedData = null;
          let extractedText = '';
          let contactInfo = {};

          if (fileData.file.type === 'application/pdf') {
            try {
              parsedData = await enhancedPdfParser.parseResume(fileData.file);
              
              // Extract text from parsed sections
              if (parsedData.sections) {
                extractedText = parsedData.sections
                  .map(section => section.content?.join(' ') || '')
                  .join('\n\n')
                  .trim();
              }
              
              // Get contact info
              contactInfo = parsedData.contact || {};
              
              console.log(`✅ PDF parsed successfully. Text length: ${extractedText.length}`);
              console.log(`✅ Contact info extracted:`, contactInfo);
              
            } catch (parseError) {
              console.warn(`⚠️ PDF parsing failed for ${fileData.name}:`, parseError);
              toast.warning(`PDF parsing failed for ${fileData.name}. You can still upload and add text manually.`);
              extractedText = '';
            }
          }

          // 🔍 Step 2: Upload file to Supabase
          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: { status: 'uploading', progress: 30 }
          }));

          const uploadResult = await uploadResumeToSupabase(
            currentUser.uid,
            fileData.file,
            (progress) => {
              // Map upload progress to 30-80% range
              const adjustedProgress = 30 + (progress * 0.5);
              setUploadProgress(prev => ({
                ...prev,
                [fileData.id]: { status: 'uploading', progress: adjustedProgress }
              }));
            }
          );

          // 🔍 Step 3: Create comprehensive resume metadata with extracted text
          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: { status: 'processing', progress: 90 }
          }));

          const resumeMetadata = {
            id: fileData.id,
            fileName: fileData.name,
            fileSize: fileData.size,
            fileType: fileData.file.type,
            uploadedAt: fileData.uploadedAt,
            analyzedAt: new Date().toISOString(),
            downloadURL: uploadResult.downloadURL,
            storagePath: uploadResult.storagePath,
            userId: currentUser.uid,
            status: 'uploaded',
            parsed: !!extractedText,

            // 🎯 CRITICAL: Store extracted text in multiple places for compatibility
            extractedText: extractedText,
            content: extractedText,
            text: extractedText,
            rawText: extractedText,

            // 🎯 Store analysis data with text in multiple places
            analysis: {
              extractedText: extractedText,
              content: extractedText,
              text: extractedText,
              contactInfo: contactInfo,
              
              // Include parsed data if available
              ...(parsedData && {
                sections: parsedData.sections,
                skills: parsedData.skills,
                experience: parsedData.experience,
                education: parsedData.education,
                qualityMetrics: parsedData.qualityMetrics,
                skillAnalysis: parsedData.skillAnalysis,
                confidence: parsedData.confidence,
                pageCount: parsedData.pageCount,
                sectionCount: parsedData.sectionCount,
                characterCount: parsedData.characterCount
              })
            },

            // 🎯 Include contact info at top level for easy access
            contactInfo: contactInfo,

            // 🎯 Include parsed sections for advanced features
            sections: parsedData?.sections || [],
            
            // 🎯 Metadata for AI analysis
            textLength: extractedText.length,
            wordCount: extractedText.split(/\s+/).filter(word => word.length > 0).length,
            hasValidText: extractedText.length >= 100,
            
            // 🎯 Quality metrics
            qualityMetrics: parsedData?.qualityMetrics || {
              overallScore: extractedText.length > 100 ? 70 : 30,
              overallConfidence: extractedText.length > 100 ? 0.8 : 0.4
            }
          };

          // 🔍 Step 4: Save metadata to database
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
          console.log(`📄 Stored resume data with text length: ${extractedText.length}`);

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
        const successCount = results.length;
        const parsedCount = results.filter(r => r.parsed).length;
        
        toast.success(`✅ Successfully uploaded ${successCount} resume(s)! ${parsedCount} parsed successfully.`);
        console.log(`🎉 Upload completed: ${successCount} files, ${parsedCount} parsed`);
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
  
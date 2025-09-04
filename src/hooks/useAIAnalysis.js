import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiResumeAnalyzer } from '../services/aiService';
import { toast } from 'react-hot-toast';

export const useAIAnalysis = () => {
  const queryClient = useQueryClient();

  const aiAnalysisMutation = useMutation({
    mutationFn: async ({ resumeText, resumeData, analysisMode }) => {
      // 🔍 ADD: Debug logging to see if mutation starts
      console.log('🔍 MUTATION STARTED:', { 
        textLength: resumeText?.length,
        fileName: resumeData?.fileName,
        mode: analysisMode 
      });

      // Improved validation with better error handling
      if (!resumeText || typeof resumeText !== 'string') {
        throw new Error('Please provide valid resume text for analysis');
      }

      const trimmedText = resumeText.trim();
      const textLength = trimmedText.length;
      const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length;

      // More detailed validation
      if (textLength < 50) {
        throw new Error(`Resume text is too short (${textLength} characters). Please add more content for meaningful analysis. Minimum: 100 characters recommended.`);
      }
      
      if (textLength < 100) {
        // Allow analysis but warn about limited accuracy
        toast.warning(`⚠️ Short resume text (${textLength} chars) may reduce analysis accuracy. Consider adding more details for better insights.`, {
          duration: 6000
        });
      }

      if (wordCount < 20) {
        throw new Error(`Resume has too few words (${wordCount}). Please add more detailed descriptions. Minimum: 30 words recommended.`);
      }

      // 🔍 ADD: Debug before calling AI service
      console.log('🔍 Calling aiResumeAnalyzer.analyzeResume...');
      const result = await aiResumeAnalyzer.analyzeResume(trimmedText, resumeData);
      
      // 🔍 ADD: Debug the result
      console.log('🔍 AI Service returned:', result);
      
      // 🎯 CRITICAL: Make sure we return the result
      return result;
    },
    onSuccess: (data) => {
      // 🔍 ADD: Debug onSuccess
      console.log('🔍 Mutation onSuccess called with:', data);
      
      const source = data.source === 'ai' ? 'AI' : 'Smart';
      toast.success(`✨ ${source} analysis completed successfully! Found ${Object.values(data.analysis.skills || {}).flat().length} skills.`);
      
      // Save to history
      const history = JSON.parse(localStorage.getItem('ai_analysis_history') || '[]');
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...data
      };
      
      localStorage.setItem('ai_analysis_history', JSON.stringify([
        newEntry,
        ...history.slice(0, 9) // Keep last 10
      ]));
      
      queryClient.invalidateQueries({ queryKey: ['ai-analysis-history'] });
    },
    onError: (error) => {
      // 🔍 ADD: Debug onError
      console.log('🔍 Mutation onError called with:', error);
      
      // More specific error messages
      const message = error.message || 'Analysis failed';
      
      if (message.includes('too short')) {
        toast.error(`📝 ${message}`, { duration: 7000 });
      } else if (message.includes('too few words')) {
        toast.error(`📝 ${message}`, { duration: 7000 });
      } else {
        toast.error(`❌ ${message}`, { duration: 5000 });
      }
      
      console.error('AI Analysis Error:', error);
    }
  });

  const analysisHistory = useQuery({
    queryKey: ['ai-analysis-history'],
    queryFn: () => {
      const stored = localStorage.getItem('ai_analysis_history');
      return stored ? JSON.parse(stored) : [];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // 🔍 ADD: Debug current mutation state
  console.log('🔍 useAIAnalysis hook state:', {
    isPending: aiAnalysisMutation.isPending,
    data: aiAnalysisMutation.data,
    error: aiAnalysisMutation.error,
    status: aiAnalysisMutation.status
  });

  return {
    // 🎯 OPTION 1: Keep using mutate (recommended)
    analyzeResume: aiAnalysisMutation.mutate,
    isAnalyzing: aiAnalysisMutation.isPending,
    analysisError: aiAnalysisMutation.error,
    analysisResult: aiAnalysisMutation.data,
    analysisHistory: analysisHistory.data || [],
    resetAnalysis: () => aiAnalysisMutation.reset()
  };
};

// Hook for quota tracking (unchanged)
export const useAIQuota = () => {
  return useQuery({
    queryKey: ['ai-quota'],
    queryFn: () => {
      const requestCount = parseInt(localStorage.getItem('hf_requests_count') || '0');
      const maxRequests = 30000;
      
      return {
        used: requestCount,
        remaining: Math.max(0, maxRequests - requestCount),
        total: maxRequests,
        percentage: (requestCount / maxRequests) * 100
      };
    },
    refetchInterval: 1000 * 60 * 5 // Refresh every 5 minutes
  });
};

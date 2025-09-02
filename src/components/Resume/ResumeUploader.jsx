import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ResumeUploader = ({ onFileUpload, maxFiles = 5 }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // File validation function
  const validateFile = (file) => {
    const validTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    
    if (!validTypes.includes(file.type)) {
      throw new Error(`${file.name}: Only PDF files are allowed`);
    }
    
    if (file.size > maxSize) {
      throw new Error(`${file.name}: File size must be less than 10MB`);
    }
    
    return true;
  };

  // Handle dropped files
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    console.log('📁 Files dropped:', { accepted: acceptedFiles.length, rejected: rejectedFiles.length });
    
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        toast.error(`${file.name}: ${error.message}`);
      });
    });

    // Process accepted files
    const validFiles = [];
    
    for (const file of acceptedFiles) {
      try {
        validateFile(file);
        validFiles.push(file);
        console.log('✅ Valid file:', file.name);
      } catch (error) {
        toast.error(error.message);
        console.log('❌ Invalid file:', error.message);
      }
    }

    if (validFiles.length > 0) {
      setIsProcessing(true);
      
      try {
        // Add files to uploaded list with metadata
        const filesWithMetadata = validFiles.map(file => ({
          id: Date.now() + Math.random(), // Simple ID generation
          file,
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
          status: 'uploaded',
          progress: 100
        }));

        setUploadedFiles(prev => [...prev, ...filesWithMetadata]);
        
        // Call parent component's upload handler
        if (onFileUpload) {
          await onFileUpload(filesWithMetadata);
        }
        
        toast.success(`Successfully uploaded ${validFiles.length} file(s)!`);
        console.log('🎉 Upload completed successfully');
        
      } catch (error) {
        toast.error('Failed to process uploaded files');
        console.error('❌ Upload error:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [onFileUpload]);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    disabled: isProcessing
  });

  // Dynamic styling based on drag state
  const getDropzoneClassName = () => {
    let baseClasses = "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer";
    
    if (isDragAccept) {
      return `${baseClasses} border-green-400 bg-green-50 text-green-700`;
    }
    if (isDragReject) {
      return `${baseClasses} border-red-400 bg-red-50 text-red-700`;
    }
    if (isDragActive) {
      return `${baseClasses} border-blue-400 bg-blue-50 text-blue-700`;
    }
    
    return `${baseClasses} border-gray-300 hover:border-gray-400 text-gray-600 hover:bg-gray-50`;
  };

  // Remove uploaded file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast.success('File removed');
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📄 Upload Your Resume</h2>
        <p className="text-gray-600">
          Upload your PDF resume(s) to analyze skills, keywords, and career progression. 
          Maximum {maxFiles} files, 10MB each.
        </p>
      </div>

      {/* Dropzone Area */}
      <div {...getRootProps()} className={getDropzoneClassName()}>
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {/* Dynamic Icon */}
          {isDragActive ? (
            <div className="animate-bounce">
              <Upload className="h-12 w-12 text-blue-500" />
            </div>
          ) : (
            <FileText className="h-12 w-12 text-gray-400" />
          )}

          {/* Dynamic Text */}
          <div className="text-center">
            {isDragReject ? (
              <div className="text-red-600">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <p className="font-semibold">Only PDF files are accepted</p>
                <p className="text-sm">Please upload valid PDF resume files</p>
              </div>
            ) : isDragActive ? (
              <div className="text-blue-600">
                <p className="text-lg font-semibold">Drop your resume files here!</p>
                <p className="text-sm">Release to upload your PDF files</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  {isProcessing ? 'Processing files...' : 'Drag & drop your resume files here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or <span className="text-blue-600 underline">click to browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: PDF files up to 10MB each
                </p>
              </div>
            )}
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm font-medium">Processing files...</span>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Uploaded Files ({uploadedFiles.length})
          </h3>
          
          <div className="space-y-3">
            {uploadedFiles.map((fileData) => (
              <div 
                key={fileData.id} 
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{fileData.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileData.size)} • Uploaded {fileData.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Ready</span>
                  </div>
                  
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Remove file"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Statistics */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm text-blue-800">
            <span>Total files: {uploadedFiles.length}</span>
            <span>
              Total size: {formatFileSize(
                uploadedFiles.reduce((total, file) => total + file.size, 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;

import React, { useState, useEffect } from 'react';
import { getNodeApiUrl } from '../config/api';

const DocumentUpload = ({ qudemoId, companyName, onDocumentsChange }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [documents, setDocuments] = useState([]);

  // Update parent component when documents change
  useEffect(() => {
    if (onDocumentsChange) {
      onDocumentsChange(documents);
    }
  }, [documents, onDocumentsChange]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      newFiles.forEach(fileObj => {
        newStatus[fileObj.id] = 'ready';
      });
      return newStatus;
    });
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileId];
      return newStatus;
    });
  };

  const uploadFile = async (fileObj) => {
    if (!qudemoId || !companyName) {
      console.error('Missing qudemoId or companyName for document upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileObj.file);
    formData.append('qudemo_id', qudemoId);
    formData.append('company_name', companyName);

    try {
      setUploadStatus(prev => ({ ...prev, [fileObj.id]: 'uploading' }));

      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl('/api/documents/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUploadStatus(prev => ({ ...prev, [fileObj.id]: 'completed' }));
        
        // Add to documents list
        const newDocument = {
          id: data.document_id,
          filename: fileObj.name,
          size: fileObj.size,
          type: fileObj.type,
          upload_status: 'processing',
          created_at: new Date().toISOString()
        };
        
        setDocuments(prev => [...prev, newDocument]);
        
        // Remove from files list after successful upload
        setTimeout(() => {
          setFiles(prev => prev.filter(f => f.id !== fileObj.id));
          setUploadStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[fileObj.id];
            return newStatus;
          });
        }, 2000);
      } else {
        setUploadStatus(prev => ({ ...prev, [fileObj.id]: 'error' }));
        console.error('Upload failed:', data.error);
      }
    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [fileObj.id]: 'error' }));
      console.error('Upload error:', error);
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const fileObj of files) {
        if (uploadStatus[fileObj.id] === 'ready') {
          await uploadFile(fileObj);
          // Small delay between uploads
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Batch upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return '📄';
      case 'uploading':
        return '⏳';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'text-gray-600';
      case 'uploading':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-800 mb-2">📄 Document Upload</h4>
        <p className="text-sm text-gray-600 mb-3">
          Upload PDF, DOC, DOCX, TXT, PPT, PPTX, or CSV files to add to your knowledge base.
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Note: Unlisted YouTube videos will not be processed.
        </p>
        
        {!qudemoId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Please create the QuDemo first, then upload documents.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.csv,.ppt,.pptx"
          multiple
          disabled={!qudemoId}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        {files.length > 0 && qudemoId && (
          <button
            type="button"
            onClick={uploadAllFiles}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </button>
        )}
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-700 text-sm">Files to Upload:</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getStatusIcon(uploadStatus[fileObj.id])}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{fileObj.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
                  </div>
                </div>
                
                {uploadStatus[fileObj.id] === 'ready' && (
                  <button
                    type="button"
                    onClick={() => removeFile(fileObj.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
                
                {uploadStatus[fileObj.id] === 'uploading' && (
                  <span className="text-xs text-blue-600">Uploading...</span>
                )}
                
                {uploadStatus[fileObj.id] === 'completed' && (
                  <span className="text-xs text-green-600">Uploaded</span>
                )}
                
                {uploadStatus[fileObj.id] === 'error' && (
                  <button
                    type="button"
                    onClick={() => uploadFile(fileObj)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Retry
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-700 text-sm">Uploaded Documents:</h5>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{doc.filename}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.size)} • {doc.upload_status}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-green-600">Processing...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
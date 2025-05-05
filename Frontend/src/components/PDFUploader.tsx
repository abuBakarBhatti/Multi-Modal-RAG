import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  AlertTitle,
  useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDropzone } from 'react-dropzone';
import { uploadPDF } from '../api/api';

interface PDFUploaderProps {
  onUploadSuccess: () => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const theme = useTheme();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Accept only the first file
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setUploadError('Please upload a valid PDF file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadError(null);
    
    try {
      const success = await uploadPDF(selectedFile);
      if (success) {
        setUploadSuccess(true);
        onUploadSuccess();
      } else {
        setUploadError('Upload failed. Please try again.');
      }
    } catch (error) {
      setUploadError('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    setUploadError(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Upload PDF Document
      </Typography>
      
      {!uploadSuccess ? (
        <>
          <Box 
            {...getRootProps()} 
            sx={{
              border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 2,
              p: 3,
              mb: 2,
              backgroundColor: isDragActive ? `${theme.palette.primary.main}10` : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
            <Typography align="center">
              {isDragActive
                ? "Drop the PDF here"
                : "Drag and drop a PDF file here, or click to select"}
            </Typography>
          </Box>
          
          {selectedFile && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Selected file: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </Typography>
            </Box>
          )}
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </Button>
        </>
      ) : (
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Success</AlertTitle>
          PDF uploaded successfully! You can now ask questions about the document.
        </Alert>
      )}
      
      {uploadSuccess && (
        <Button variant="outlined" onClick={resetUpload} sx={{ mt: 2 }}>
          Upload Another PDF
        </Button>
      )}
      
      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {uploadError}
        </Alert>
      )}
    </Paper>
  );
};

export default PDFUploader;

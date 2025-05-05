import React, { useState } from 'react';
import { Container, Box, Typography, AppBar, Toolbar, Alert, AlertTitle, CssBaseline } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import { ThemeProvider } from './context/ThemeContext';
// import ThemeToggle from './components/ThemeToggle';
import PDFUploader from './components/PDFUploader';
import ChatBox from './components/ChatBox';
import MessageInput from './components/MessageInput';
import { Message } from './types';
import { queryPDF } from './api/api';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      const response = await queryPDF(text);
      
      // Add bot response
      const botMessage: Message = {
        id: uuidv4(),
        text: response.answer,
        sender: 'bot',
        images: response.images,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('Failed to get a response. Please try again.');
      console.error('Error querying PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setPdfUploaded(true);
    // Optional: Add a system message notifying the user they can start asking questions
    const systemMessage: Message = {
      id: uuidv4(),
      text: "Your PDF has been processed successfully. You can now ask questions about its content!",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  return (
    <ThemeProvider>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              RAG PDF AI Assistant
            </Typography>
            {/* <ThemeToggle /> */}
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <PDFUploader onUploadSuccess={handleUploadSuccess} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <ChatBox messages={messages} />
            <MessageInput 
              onSendMessage={handleSendMessage} 
              loading={loading} 
              disabled={!pdfUploaded}
            />
          </Box>
          
          {!pdfUploaded && messages.length === 0 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                Please upload a PDF document to start the conversation.
              </Typography>
            </Box>
          )}
        </Container>
        
        <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="body2" color="text.secondary">
            RAG PDF AI Assistant © {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
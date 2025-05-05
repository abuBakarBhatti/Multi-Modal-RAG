import React, { useRef, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, Divider } from '@mui/material';
import { Message } from '../types';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ImageViewer from './ImageViewer';
import ReactMarkdown from 'react-markdown';

interface ChatBoxProps {
  messages: Message[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="textSecondary" align="center">
          No conversation yet. Upload a PDF and start asking questions!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, minHeight: '400px', maxHeight: '60vh', overflow: 'auto' }}>
      {messages.map((message, index) => (
        <Box key={message.id} sx={{ mb: 2 }}>
          {index > 0 && <Divider sx={{ my: 2 }} />}
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Avatar sx={{ 
              bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
              mr: 2
            }}>
              {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold' }}>
                {message.sender === 'user' ? 'You' : 'AI Assistant'}
                <Typography variant="caption" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Typography>
              
              <Box sx={{ mt: 1 }}>
                {message.sender === 'bot' ? (
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: (theme) => 
                      theme.palette.mode === 'light' 
                        ? 'rgba(0,0,0,0.04)' 
                        : 'rgba(255,255,255,0.05)' 
                  }}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                    {message.images && message.images.length > 0 && (
                      <ImageViewer images={message.images} />
                    )}
                  </Box>
                ) : (
                  <Typography variant="body1">{message.text}</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
      <div ref={endOfMessagesRef} />
    </Paper>
  );
};

export default ChatBox;

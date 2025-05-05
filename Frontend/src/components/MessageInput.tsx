import React, { useState } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  loading: boolean;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, loading, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !loading && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
      <TextField
        fullWidth
        placeholder="Ask a question about the PDF..."
        variant="outlined"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading || disabled}
        sx={{ mr: 1 }}
      />
      <IconButton 
        color="primary" 
        type="submit" 
        disabled={!message.trim() || loading || disabled}
        sx={{ 
          height: 56, 
          width: 56,
          backgroundColor: (theme) => theme.palette.primary.main,
          color: 'white',
          '&:hover': {
            backgroundColor: (theme) => theme.palette.primary.dark,
          },
          '&.Mui-disabled': {
            backgroundColor: (theme) => theme.palette.action.disabledBackground,
            color: (theme) => theme.palette.action.disabled,
          }
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
      </IconButton>
    </Box>
  );
};

export default MessageInput;
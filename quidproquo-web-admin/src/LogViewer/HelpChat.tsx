import React, { useState } from 'react';
import { Box, TextField, Button, Avatar, Typography } from '@mui/material';

interface ChatMessage {
  id: number;
  name: string;
  icon: string;
  message: string;
}

const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    name: 'John Doe',
    icon: 'https://example.com/avatar1.png',
    message: 'Hello, how can I help you today?',
  },
  {
    id: 2,
    name: 'Jane Smith',
    icon: 'https://example.com/avatar2.png',
    message: 'I have a question about the log details.',
  },
];

export const HelpChat: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      const newMessage: ChatMessage = {
        id: chatMessages.length + 1,
        name: 'You',
        icon: 'https://example.com/user-avatar.png',
        message: inputMessage,
      };
      setChatMessages([...chatMessages, newMessage]);
      setInputMessage('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {chatMessages.map((message) => (
          <Box key={message.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar src={message.icon} alt={message.name} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="subtitle2">{message.name}</Typography>
              <Typography variant="body1">{message.message}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
        <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={handleSendMessage}>
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

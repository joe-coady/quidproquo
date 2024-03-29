import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Avatar, Typography, Paper } from '@mui/material';
import { Person as PersonIcon, Android as AndroidIcon } from '@mui/icons-material';

interface ChatMessage {
  id: number;
  name: string;
  icon: JSX.Element;
  message: string;
  isAi: boolean;
}

const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    name: 'AI Assistant',
    icon: <AndroidIcon />,
    message: 'Hello, how can I help you today?',
    isAi: true,
  },
  {
    id: 2,
    name: 'You',
    icon: <PersonIcon />,
    message: 'I have a question about the log details.',
    isAi: false,
  },
  {
    id: 3,
    name: 'AI Assistant',
    icon: <AndroidIcon />,
    message: 'Sure, what would you like to know about the log details?',
    isAi: true,
  },
  {
    id: 4,
    name: 'You',
    icon: <PersonIcon />,
    message: 'How can I filter the logs by a specific error message?',
    isAi: false,
  },
];

export const HelpChat: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      const newMessage: ChatMessage = {
        id: chatMessages.length + 1,
        name: 'You',
        icon: <PersonIcon />,
        message: inputMessage,
        isAi: false,
      };
      setChatMessages([...chatMessages, newMessage]);
      setInputMessage('');
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }} ref={chatContainerRef}>
        {chatMessages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mb: 2,
              justifyContent: message.isAi ? 'flex-start' : 'flex-end',
            }}
          >
            <Paper
              sx={{
                p: 2,
                borderRadius: message.isAi ? '20px 20px 20px 0' : '20px 20px 0 20px',
                backgroundColor: message.isAi ? 'grey.300' : 'primary.main',
                color: message.isAi ? 'black' : 'white',
                maxWidth: '70%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 1, bgcolor: message.isAi ? 'grey.500' : 'primary.dark' }}>
                  {message.icon}
                </Avatar>
                <Typography variant="subtitle2">{message.name}</Typography>
              </Box>
              <Typography variant="body1">{message.message}</Typography>
            </Paper>
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

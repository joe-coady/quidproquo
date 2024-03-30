import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Avatar, Typography, Paper, CircularProgress } from '@mui/material';
import { Person as PersonIcon, Android as AndroidIcon } from '@mui/icons-material';
import { useAuthAccessToken } from '../../Auth/hooks';
import { apiRequestPost } from '../../logic';
import { LogChatMessage, SendLogChatMessage, ListLogChatMessages } from '../../types';
import { QpqPagedData } from 'quidproquo-core';

interface HelpChatProps {
  logCorrelation: string;
}

export const HelpChat: React.FC<HelpChatProps> = ({ logCorrelation }) => {
  const [chatMessages, setChatMessages] = useState<LogChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState(0);
  const [nextPageKey, setNextPageKey] = useState<string | undefined>(undefined);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthAccessToken();

  useEffect(() => {
    fetchChatMessages();
  }, []);

  const fetchChatMessages = async () => {
    const listLogChatMessages: ListLogChatMessages = {
      correlationId: logCorrelation,
      nextPageKey: nextPageKey,
    };

    try {
      const response = await apiRequestPost<QpqPagedData<LogChatMessage>>(
        '/log/chat',
        listLogChatMessages,
        accessToken,
      );

      setChatMessages((prevMessages) => [...prevMessages, ...response.items]);
      setNextPageKey(response.nextPageKey);
    } finally {
      // Do nothing
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      const newMessage: LogChatMessage = {
        message: inputMessage,
        timestamp: new Date().toISOString(),
        isAi: false,
      };
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');

      const sendLogChatMessage: SendLogChatMessage = {
        correlationId: logCorrelation,
        message: inputMessage,
      };

      setPendingRequests((prevCount) => prevCount + 1);

      try {
        const response = await apiRequestPost<LogChatMessage>(
          '/log/chat/message',
          sendLogChatMessage,
          accessToken,
        );

        setChatMessages((prevMessages) => [...prevMessages, response]);
      } finally {
        setPendingRequests((prevCount) => prevCount - 1);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
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
        {chatMessages.map((message, index) => (
          <Box
            key={index}
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
                  {message.isAi ? <AndroidIcon /> : <PersonIcon />}
                </Avatar>
                <Typography variant="subtitle2">{message.isAi ? 'AI Assistant' : 'You'}</Typography>
              </Box>
              <div dangerouslySetInnerHTML={{ __html: message.message }}></div>
            </Paper>
          </Box>
        ))}
        {pendingRequests > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mb: 2,
              justifyContent: 'flex-start',
            }}
          >
            <Paper
              sx={{
                p: 2,
                borderRadius: '20px 20px 20px 0',
                backgroundColor: 'grey.300',
                color: 'black',
                maxWidth: '70%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 1, bgcolor: 'grey.500' }}>
                  <AndroidIcon />
                </Avatar>
                <Typography variant="subtitle2">AI Assistant</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body1">Thinking...</Typography>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
        <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
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

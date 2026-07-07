import { useEffectCallback } from 'quidproquo-web-react';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { Android as AndroidIcon, Person as PersonIcon } from '@mui/icons-material';
import { Avatar, Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';

import { useAdminApp, useVolatileState } from '../../adminApp';

interface HelpChatProps {
  logCorrelation: string;
}

export const HelpChat: React.FC<HelpChatProps> = ({ logCorrelation }) => {
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [api] = useAdminApp();
  const volatile = useVolatileState();

  const chat = volatile.chatByCorrelation[logCorrelation];
  const chatMessages = useMemo(() => chat?.messages ?? [], [chat?.messages]);
  const pendingRequests = chat?.pendingReplies ?? 0;

  // Stable identity so the mount-only effect below can list it as a dependency.
  const fetchChatMessages = useEffectCallback(() => {
    api.loadChatMessages(logCorrelation);
  });

  useEffect(() => {
    fetchChatMessages();
  }, [fetchChatMessages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      api.sendChatMessage(logCorrelation, inputMessage);
      setInputMessage('');
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
      <Box ref={chatContainerRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
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
                <Avatar
                  sx={{
                    mr: 1,
                    bgcolor: message.isAi ? 'grey.500' : 'primary.dark',
                  }}
                >
                  {message.isAi ? <AndroidIcon /> : <PersonIcon />}
                </Avatar>
                <Typography variant="subtitle2">{message.isAi ? 'AI Assistant' : 'You'}</Typography>
              </Box>
              <Markdown>{message.message}</Markdown>
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
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            sx={{ mr: 2 }}
            value={inputMessage}
            variant="outlined"
          />
          <Button onClick={handleSendMessage} variant="contained">
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

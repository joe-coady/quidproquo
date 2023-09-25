import React, { ReactNode, useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface AsyncButtonProps {
    onClick: () => Promise<void>;
    children?: ReactNode;
}

export function AsyncButton({ onClick, children }: AsyncButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error("Login error:", error);
      // Handle error, show a message, etc.
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLogin} 
      fullWidth 
      variant="contained" 
      color="primary" 
      disabled={loading}
    >
      {loading ? <CircularProgress size={24} /> : children}
    </Button>
  );
}
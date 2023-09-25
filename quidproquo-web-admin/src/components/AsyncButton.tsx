import React, { ReactNode, useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface AsyncButtonProps {
    onClick: (event: any) => Promise<void>;
    children?: ReactNode;
    disabled?: boolean;
    style?: React.CSSProperties;
    type?: "button" | "submit" | "reset";
}

export function AsyncButton({ onClick, children, disabled, style, type }: AsyncButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: any) => {
    setLoading(true);
    try {
      await onClick(event);
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
      disabled={loading || disabled}
      style={style}
      type={type}
    >
      {loading ? <CircularProgress size={24} /> : children}
    </Button>
  );
}
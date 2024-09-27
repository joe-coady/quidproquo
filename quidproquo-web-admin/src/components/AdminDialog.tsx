import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, AppBar } from '@mui/material';
import { useState } from 'react';

export const useAdminDialog = (tabs: string[], defaultTab: string) => {
  const [open, setIsOpen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>(defaultTab);

  return {
    open,
    tabs,
    selectedTab,
    openDialog: () => setIsOpen(true),
    onSelectTab: (tab: string) => {
      setSelectedTab(tab);
    },
    handleClose: () => setIsOpen(false),
  };
};

interface AdminDialogProps {
  open: boolean;
  handleClose: () => void;

  title: string;

  tabs: string[];
  selectedTab: string;
  onSelectTab: (tabName: string) => void;

  buttons: {
    text: string;
    onClick: () => Promise<void>;
    disabled: boolean;
  }[];

  children: React.ReactNode;
}

export const AdminDialog = ({ open, handleClose, title, selectedTab, onSelectTab, tabs, buttons, children }: AdminDialogProps) => {
  const selectedTabIndex = tabs.findIndex((t) => t === selectedTab);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    onSelectTab(tabs[newValue]);
  };

  return (
    <Dialog
      open={open}
      scroll={'paper'}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      onClose={handleClose}
      maxWidth={false}
      fullWidth={true}
      PaperProps={{
        style: {
          width: '90%',
          height: '90%',
          maxHeight: '90%',
          maxWidth: '90%',
        },
      }}
    >
      <DialogTitle id="scroll-dialog-title">{title}</DialogTitle>
      {tabs.length > 0 && (
        <AppBar position="sticky" color="primary">
          <Tabs value={selectedTabIndex} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
            {tabs.map((t) => (
              <Tab label={t} key={t} />
            ))}
          </Tabs>
        </AppBar>
      )}
      <DialogContent
        dividers={true}
        sx={{
          minHeight: '150px',
          overflowY: 'scroll',
        }}
      >
        {children}
      </DialogContent>

      {buttons.length > 0 && (
        <DialogActions>
          {buttons.map((b) => (
            <Button key={b.text} disabled={b.disabled} onClick={b.onClick}>
              {b.text}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
};

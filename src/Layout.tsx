import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import Paper from '@mui/material/Paper';
import ColorModeSelect from './pages/shared-theme/ColorModeSelect';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Snackbar, Menu, MenuItem, IconButton, Badge, Typography } from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import './Layout.css'

// backend url link
export const apiUrl = import.meta.env.VITE_API_URL;

export const socket = io(apiUrl);

const notificationSound = new Audio('src/audios/simple-notification-152054.mp3');

// Play the sound when a notification arrives
function playNotificationSound() {
  notificationSound.play();
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Show notification with sound
  const showNotification = (message: string) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('New Notification', {
        body: message,
        icon: 'path_to_your_icon/notification-icon.png', // Optional icon
      });

      playNotificationSound(); // Play sound when notification appears

      notification.onclick = () => {
        console.log('Notification clicked!');
      };
    }
  };

  useEffect(() => {
    (ref.current as HTMLDivElement).ownerDocument.body.scrollTop = 0;
    // Listen for server messages
    socket.on('connect', () => {
      console.log('Connected to server as Client 1');

      // Send a message to the server
      socket.emit('message', 'Hello from Client 1');
    });

    // Listen for broadcast messages
    socket.on('message', (data) => {
      console.log(`Client 1 received: ${data}`);
    });

    // Request permission for notifications when the component mounts
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }, [value]);

  return (
    <Box sx={{ pb: 7 }} ref={ref}>
      <CssBaseline />
      <div id="setting-nav">
        <ColorModeSelect />
        <NotificationIconWithMenu />
      </div>
      <div className="info-nav">
        info here
        <button onClick={() => showNotification('abc')}>show notification</button>
      </div>
      <div id="layout-children">{children}</div>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_, newValue: number) => { 
            setValue(newValue);
          }}
        >
          <BottomNavigationAction onClick={() => navigate('/')} label="Orders" icon={<RestaurantIcon />} />
          <BottomNavigationAction onClick={() => navigate('/menu')} label="Menu Mangement" icon={<MenuBookIcon />} />
          {/* <BottomNavigationAction onClick={() => navigate("/settings")} label="Staff and settings" icon={<SettingsAccessibilityIcon />} /> */}
          <BottomNavigationAction
            label="Profile"
            icon={
              <>
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </>
            }
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

const NotificationIconWithMenu = () => {
  // State management for the notification icon and menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const notifications = [
    'New order received!',
    'Payment failed!',
    'Order shipped successfully!',
  ];

  // Open and close the Menu
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Open menu
  };

  const handleClose = () => {
    setAnchorEl(null); // Close menu
  };

  // Function to handle snackbar open
  const handleSnackbarOpen = () => {
    setOpenSnackbar(true);
  };

  // Function to handle snackbar close
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
      {/* Notification Icon */}
      <IconButton onClick={handleClick} color="primary">
        <Badge badgeContent={notifications.length} color="error">
          <NotificationImportantIcon />
        </Badge>
      </IconButton>

      {/* Menu for Notifications */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: { maxHeight: 200, width: '250px' },
        }}
      >
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <MenuItem key={index} onClick={handleSnackbarOpen}>
              <Typography variant="body2">{notification}</Typography>
            </MenuItem>
          ))
        ) : (
          <MenuItem>
            <Typography variant="body2">No new notifications</Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Snackbar to show when a notification is clicked */}
      <Snackbar
        open={openSnackbar}
        onClose={handleSnackbarClose}
        message="Notification clicked!"
        autoHideDuration={3000}
      />
    </Box>
  );
};
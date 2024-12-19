import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import Paper from "@mui/material/Paper";
import ColorModeSelect from "./pages/shared-theme/ColorModeSelect";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Snackbar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Typography,
} from "@mui/material";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import "./Layout.css";
import Marquee from "react-fast-marquee";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useAppDispatch, useAppSelector } from "./store/hooks/hooks";
import { update } from "./store/slices/socketSlice";
import { addNotification } from "./store/slices/notificationsSlice";
import { clearNotifications } from "./store/slices/notificationsSlice";


export const apiUrl = import.meta.env.VITE_API_URL;
export const socket = io(import.meta.env.VITE_SOCKET_API_URL, {
  reconnection: true, // Allow reconnections
  reconnectionAttempts: 5, // Number of attempts before giving up
  reconnectionDelay: 2000, // Delay between reconnection attempts
});



// const notificationSound = new Audio("src/audios/simple-notification-152054.mp3");

// Play notification sound
// function playNotificationSound() {
//   notificationSound.play();
// }

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isInitialized = useRef(false); // Ensure one-time initialization
  const socketRef = useRef(socket);
  const [socketConnection, setSocketConnection] = useState(false)

  useEffect(() => {

    const socketInstance = socketRef.current;

    // Ensure this block runs only once per session
    if (!isInitialized.current) {
      isInitialized.current = true;

      // Clear local storage only once during the session
      if (!sessionStorage.getItem("localStorageCleared")) {
        localStorage.clear();
        sessionStorage.setItem("localStorageCleared", "true");
        console.log("Local storage cleared once for this session.");
      }
    }

    if (ref.current) {
      ref.current.ownerDocument.body.scrollTop = 0;
    }

    // Request notification permission
    if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        }
      });
    }

    // Socket setup
    socketInstance.on("connect", () => {
      setSocketConnection(true)
      console.log("Socket connected with ID:", socket.id);
    });

    socketInstance.on("order-update-server", () => {
      dispatch(update());
    });

    // Join specific rooms for notifications
    socket.emit('joinRoom', 'menu');
    socket.emit('joinRoom', 'order');
    socket.emit('joinRoom', 'payment');

    // Listen for notifications
    socketInstance.on('notification', (data: String) => {
      dispatch(addNotification(data));
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`Disconnected: ${reason}`);
    });
    // Cleanup on unmount
    return () => {
      setSocketConnection(false)
      socketInstance.off("connect");
      socketInstance.off("order-update-server");
      socketInstance.off('notification');
    };
  }, [dispatch, socketConnection]);


  return (
    <Box
      sx={{
        pb: 7,
        maxWidth: "100%",
        overflowX: "hidden",
      }}
      ref={ref}
    >
      <CssBaseline />
      <div id="setting-nav" style={{ overflowX: "hidden" }}>
        <ColorModeSelect />
        <NotificationIconWithMenu />
      </div>
      <div className="info-nav" style={{ maxWidth: "100%", overflowX: "hidden" }}>
        <Marquee style={{ wordBreak: "break-word" }}>
          Canteen will be closed on Sundays.
        </Marquee>
      </div>
      <div id="layout-children" style={{ overflowX: "hidden" }}>
        {children}
      </div>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_, newValue: number) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction
            onClick={() => navigate("/")}
            label="Orders"
            icon={<RestaurantIcon />}
          />
          <BottomNavigationAction
            onClick={() => navigate("/menu")}
            label="Menu Management"
            icon={<MenuBookIcon />}
          />
          <BottomNavigationAction
            onClick={() => navigate("/payments")}
            label="Payments"
            icon={<CurrencyRupeeIcon />}
          />
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const notificationss = useAppSelector(state => state.notifications)
  const notifications = notificationss.notifications
  const dispatch = useAppDispatch();

  // const notifications = [
  //   "New order received!",
  //   "Payment failed!",
  // ];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarOpen = () => {
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  console.log("notifications length",notifications.length)

  function handleClear() {

    dispatch(clearNotifications())

  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
      <IconButton onClick={handleClick} color="primary">
        <Badge badgeContent={notifications.length} color="error">
          <NotificationImportantIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: { maxHeight: 200, width: "90%" },
        }}
      >
        {notifications.length > 0 ? (<div>
          <MenuItem onClick={handleClear}>
            <Typography variant="body2">Clear all</Typography>
          </MenuItem>

          {notifications.map((notification, index) => (
            <MenuItem key={index} onClick={handleSnackbarOpen}>
              <Typography variant="body2">{notification}</Typography>
            </MenuItem>
          ))}

         


        </div>) : (
          <MenuItem>
            <Typography variant="body2">No new notifications</Typography>
          </MenuItem>
        )}
      </Menu>
      <Snackbar
        open={openSnackbar}
        onClose={handleSnackbarClose}
        message="Notification clicked!"
        autoHideDuration={3000}
      />
    </Box>
  );
};
import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import Paper from "@mui/material/Paper";
import ColorModeSelect from "./pages/shared-theme/ColorModeSelect";
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
import "./Layout.css";
import Marquee from "react-fast-marquee";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useAppDispatch, useAppSelector } from "./store/hooks/hooks";
import { update } from "./store/slices/socketSlice";
import { addNotification, clearNotifications } from "./store/slices/notificationsSlice";
import { useLocation } from "react-router-dom";
import NotificationsIcon from '@mui/icons-material/Notifications';
import "react-toastify/dist/ReactToastify.css";
import PhonelinkRingIcon from '@mui/icons-material/PhonelinkRing';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PhonelinkEraseIcon from '@mui/icons-material/PhonelinkErase';
import { setWebWorkerDetails } from "./store/slices/appSlice";
import { fetchKitchenStatus, updateKitchenStatus } from "./store/slices/authSlice";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleTranslate from "./components/GoogleTranslate";
import { cacheAudioFile } from "./utils/cacheAudioFile";

export const apiUrl = import.meta.env.VITE_API_URL;
const socket_url = import.meta.env.VITE_SOCKET_API_URL;
export const socket = io(`${socket_url}/kitchen`, {
  reconnection: true, // Allow reconnections
  reconnectionAttempts: 5, // Number of attempts before giving up
  reconnectionDelay: 2000, // Delay between reconnection attempts
});

const audioUrl = 'public/simple-notification-152054.mp3'
cacheAudioFile(audioUrl);

export const playNotificationSound = async (audioUrl: string) => {
  if ('caches' in window) {
    try {
      const cacheName = 'notification-sounds';
      const cache = await caches.open(cacheName);
      const response = await cache.match(audioUrl);
      if (response) {
        const audioBlob = await response.blob();
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.play();
      } else {
        console.warn('Audio file not found in cache. Playing from server...');
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
};

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
  const location = useLocation();
  const { isLoggedIn } = useAppSelector(state => state.auth)
  const {pendingOrders} = useAppSelector(state=>state.orders)
  const [ordersInvisible, setOrdersInvisible] = useState(false)

  useEffect(()=>{
    if(pendingOrders.length!==0){
      setOrdersInvisible(false)
    }else{
      setOrdersInvisible(true)
    }
  },[pendingOrders])

  useEffect(() => {
    // Use a switch statement to set the value based on the path
    switch (location.pathname) {
      case '/':
        setValue(0);
        break;
      case '/menu':
        setValue(1);
        break;
      case '/payments':
        setValue(2);
        break;
      case '/profile':
        setValue(3);
        break;
      default:
        setValue(0); // Default value for unknown paths
        break;
    }
  }, [location.pathname]);

  useEffect(() => {
    // Request permission if not already granted
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (Notification.permission === "granted") {
      new Notification("example notification", {
        body: "Welcome to this app",
      });
    } else if (Notification.permission === "denied") {
      console.warn("Notifications are blocked by the user.");
    }
  }, [location.pathname]);

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

    socketInstance.on("orderCreated", (order) => {
      console.log(order)
      playNotificationSound(audioUrl)
      dispatch(update());
      dispatch(addNotification({ type: "order", data: `${order.order.userFullName} placed an order at Cabin No.${order.order.cabinName}` }))
    });

    // Listen for notifications
    socketInstance.on('notification', (data: String) => {
      console.log(data)
      playNotificationSound(audioUrl)
    });

    socketInstance.on('welcomeMessage', (data: { message: string; vapiPublicKey: string }) => {
      console.log(data.message)
      dispatch(setWebWorkerDetails("blabla"))
      playNotificationSound(audioUrl)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log(`Disconnected: ${reason}`);
    });
    // Cleanup on unmount
    return () => {
      setSocketConnection(false)
      socketInstance.off("connect");
      socketInstance.off("order-update-server");
      socketInstance.off('notification');
      socketInstance.off('orderCreated');
      socketInstance.off('welcomeMessage')
    };
  }, [dispatch, socketConnection]);

  useEffect(() => {
    if (isLoggedIn) {

      dispatch(fetchKitchenStatus())


    }
  }, [isLoggedIn])


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

        {isLoggedIn
          ?
          <div className="icons-right">

            <PhoneIcon />

            <NotificationIconWithMenu />

          </div>
          :
          null}


      </div>
      <div className="info-nav" style={{ maxWidth: "100%", overflowX: "hidden" }}>
        <GoogleTranslate />

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
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            placeItems: "center"
          }}
        >
          <BottomNavigationAction
            onClick={() => navigate("/")}
            label="Orders"
            icon={
              <Badge color="primary" variant="dot" invisible={ordersInvisible}>
            <RestaurantIcon />
            </Badge>
            }
          />
          <BottomNavigationAction
            onClick={() => navigate("/menu")}
            label="Menu"
            icon={<MenuBookIcon />}
          />
          <BottomNavigationAction
            onClick={() => navigate("/payments")}
            label="Payments"
            icon={<CurrencyRupeeIcon />}
          />
          <BottomNavigationAction onClick={() => navigate("/profile")} label="Profile" icon={
            <AccountBoxIcon color={isLoggedIn ? "success" : undefined} />} />
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
    handleClear()

  };

  const handleSnackbarOpen = () => {
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
    handleClear()
  };

  function handleClear() {

    dispatch(clearNotifications())

  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
      <IconButton onClick={handleClick} color="primary">
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
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
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <MenuItem key={index} onClick={handleSnackbarOpen}>
              <Typography variant="body2">{notification.data}</Typography>
            </MenuItem>
          ))
        ) : (
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

const PhoneIcon = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useAppDispatch();
  const { kitchenStatus } = useAppSelector(state => state.auth)

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

  // const handleSnackbarOpen = () => {
  //   setOpenSnackbar(true);
  // };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <>      
    <ToastContainer />

      <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
        <IconButton onClick={handleClick} color="primary">
          {
            kitchenStatus
              ?
              <PhonelinkRingIcon color="success" />
              :
              <PhonelinkEraseIcon color="error" />
          }
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: { maxHeight: 200, width: "auto" },
          }}
        >
          {
            kitchenStatus
              ?
              <button onClick={async () => {
                await dispatch(updateKitchenStatus(false))
                toast.error("Offline")
                socket.emit('kitchenStatus', false)
                handleClose()
              }
              }>Off</button>
              :
              <button onClick={async () => {
                await dispatch(updateKitchenStatus(true))
                toast.success("Online")
                socket.emit('kitchenStatus', true)
                handleClose()
              }
              }>On</button>
          }
        </Menu>
        <Snackbar
          open={openSnackbar}
          onClose={handleSnackbarClose}
          message="Notification clicked!"
          autoHideDuration={3000}
        />
      </Box>
    </>
  );
};

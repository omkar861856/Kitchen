import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useAppSelector } from "../store/hooks/hooks";
import { useAppDispatch } from "../store/hooks/hooks";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { logoutUser } from "../store/slices/authSlice";
import { updateKitchenStatus } from "../store/slices/appSlice";
import QRCodeGenerator from "../components/QRGenerator";
import { socket } from "../Layout";

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleResetStore = () => {
    dispatch({ type: 'RESET_STORE' });
};

  // Select user data from Redux store
  const {firstName, lastName, phone, kitchenName, kitchenId} = useAppSelector((state) => state.auth);

  // Logout handler
  const handleLogout = async () => {
    await dispatch(updateKitchenStatus(false))
    await dispatch(logoutUser(phone));
    handleResetStore()
    socket.emit('kitchenStatus',false)
    toast.success('Logoutsuccessful!');
    navigate('/signin')
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
                    <ToastContainer />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          p: 3,
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Profile Information
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>First Name:</strong> {firstName}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Last Name:</strong> {lastName}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Phone Number:</strong> {phone}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Kitchen Name:</strong> {kitchenName}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Kitchen Id:</strong> {kitchenId}
        </Typography>
        <QRCodeGenerator />
        <a target="_blank" href={`https://canteen-mauve.vercel.app/${kitchenId}`}>`https://canteen-mauve.vercel.app/${kitchenId}`</a>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogout}
          sx={{
            textTransform: "none",
            mt: 2,
            bgcolor: "#f44336",
            "&:hover": {
              bgcolor: "#d32f2f",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default ProfilePage;
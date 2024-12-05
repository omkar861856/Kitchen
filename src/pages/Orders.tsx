import { useEffect, useState } from 'react';
import './Orders.css';
import { Typography, Card, CardContent, Grid, Divider, Box, Button, LinearProgress } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks/hooks';
import { fetchOrders } from '../store/slices/ordersSlice';
import { updateOrderStatus } from '../store/slices/ordersSlice';

import { socket } from '../Layout';
import { Order } from '../store/slices/ordersSlice';

// Define Order type interface (updated to include missing properties)
// interface Order {
//   orderId: string;
//   userId: string;
//   items: { itemId: string, quantity: number }[];
//   totalPrice: number;
//   status: string;
//   orderedAt: string | undefined;
//   completedAt: string | undefined;
// }

const Orders = () => {
  const { pendingOrders } = useAppSelector((state) => state.orders);
  const dispatch = useAppDispatch();

  // Count the number of pending orders
  const pendingCount = pendingOrders.length;

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Total Pending Orders: {pendingCount}
      </Typography>

      {pendingOrders.map((o) => (
        <OrderComponent key={o.orderId} order={o} />
      ))}
    </div>
  );
};

interface OrderProps {
  order: Order;
}

const OrderComponent = ({ order }: OrderProps) => {
  const { orderId, userId, items, totalPrice, status, orderedAt, completedAt } = order;
  
  const [completionTime, setCompletionTime] = useState(5 * 60); // 5 minutes in seconds
  const [progress, setProgress] = useState(100); // Progress starts from 100%
  const [orderStatus, setOrderStatus] = useState(status);
  const dispatch = useAppDispatch();

  // Type the timer as NodeJS.Timeout | undefined
  let timer: NodeJS.Timeout | undefined;

  useEffect(() => {
    if (orderStatus === 'pending' && completionTime > 0) {
      timer = setInterval(() => {
        setCompletionTime((prevTime) => {
          if (prevTime === 1) {
            clearInterval(timer); // Stop the timer when it reaches 0
            setOrderStatus('completed'); // Mark the order as completed
            return 0;
          }
          return prevTime - 1; // Decrease the time by 1 second
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer); // Cleanup the timer on component unmount
    };
  }, [orderStatus, completionTime]);

  useEffect(() => {
    setProgress((completionTime / (5 * 60)) * 100); // Calculate progress
  }, [completionTime]);

  const handleDelay = () => {
    setCompletionTime((prevTime) => prevTime + 5 * 60); // Add 5 minutes
  };

  const handleMarkCompleted = (orderId: string, status: string) => {
    setOrderStatus('completed');
    setCompletionTime(0); // Immediately mark the order as completed
    dispatch(updateOrderStatus({ orderId, status }));
    socket.emit('order-update', "marking order as complete"); // Send message to server
  };

  // Ensure orderedAt and completedAt are valid before passing to new Date()
  const formatDate = (date: string | undefined) => {
    return date ? new Date(date).toLocaleString() : "Not Available";
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '20px auto', borderRadius: '8px', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" color="primary" gutterBottom>
          Order ID: {orderId}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          User ID: {userId}
        </Typography>
        <Typography variant="body1" color={orderStatus === "pending" ? "orange" : "green"} fontWeight="bold">
          Status: {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" color="primary" gutterBottom>
          Items:
        </Typography>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' }}>
                <Typography variant="body2">Item ID: {item.itemId}</Typography>
                <Typography variant="body2">Quantity: {item.quantityAvailable}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ marginTop: '16px' }}>
          <Typography variant="body1" color="text.secondary" fontWeight="bold">
            Total Price: ${totalPrice}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ordered At: {formatDate(orderedAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completed At: {formatDate(completedAt)}
          </Typography>
        </Box>

        <Box sx={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {orderStatus === 'pending' && (
            <>
              <Button variant="contained" color="warning" onClick={handleDelay}>
                Delay by 5 mins
              </Button>
              <Button variant="contained" color="success" onClick={() => handleMarkCompleted(orderId, 'completed')}>
                Mark as Completed
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ marginTop: '20px' }}>
          <Typography variant="body2" color="text.secondary" fontWeight="bold">
            Time Remaining: {Math.floor(completionTime / 60)}:{String(completionTime % 60).padStart(2, '0')}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ marginTop: '8px' }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default Orders;
import React, { useEffect, useState } from 'react';
import './Orders.css';
import { Typography, Card, CardContent, Grid, Divider, Box, Button, LinearProgress } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks/hooks';
import { fetchOrders } from '../store/slices/ordersSlice';
import { updateOrderStatus } from '../store/slices/ordersSlice';

import { socket } from '../Layout';

const Orders = () => {
    const { orders,pendingOrders, loading, error } = useAppSelector((state) => state.orders);
    const dispatch = useAppDispatch();

    console.log(pendingOrders)
    // Filter the orders that are pending
    // const pending = orders.filter((order) => order.status === 'pending');

    // Count the number of pending orders
    const pendingCount = pendingOrders.length;

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    return (
        <div>
            {/* Display the total count of pending orders */}
            <Typography variant="h4" gutterBottom>
                Total Pending Orders: {pendingCount}
            </Typography>

            {/* Map through only the pending orders */}
            {pendingOrders.map((o) => (
                <Order key={o._id} order={o} />
            ))}
        </div>
    );
};

export default Orders;

const Order = ({ order }) => {
    const { orderId, userId, items, totalPrice, status, orderedAt, completedAt } = order;
    
    // Set initial completion time (5 minutes)
    const [completionTime, setCompletionTime] = useState(5 * 60); // 5 minutes in seconds
    const [progress, setProgress] = useState(100); // Progress starts from 100%
    const [orderStatus, setOrderStatus] = useState(status);
    const dispatch = useAppDispatch();

    // Update timer and progress every second
    useEffect(() => {
        let timer;

        // Only update the timer if the order is still pending
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

        return () => clearInterval(timer); // Clean up the timer when the component unmounts
    }, [orderStatus, completionTime]);

    // Calculate the percentage for the progress bar (counting down)
    useEffect(() => {
        setProgress((completionTime / (5 * 60)) * 100); // Progress based on remaining time
    }, [completionTime]);

    // Handle "Delay Order by 5 minutes"
    const handleDelay = () => {
        setCompletionTime((prevTime) => prevTime + 5 * 60); // Add 5 minutes
    };

    // Handle "Mark as Completed"
    const handleMarkCompleted = (orderId: string, status: string) => {
        setOrderStatus('completed');
        setCompletionTime(0); // Immediately mark the order as completed
        dispatch(updateOrderStatus({ orderId, status }));
        socket.emit('order-update', "marking order as complete"); // Send message to server

    };



    return (
        <Card sx={{ maxWidth: 600, margin: '20px auto', borderRadius: '8px', boxShadow: 3 }}>
            <CardContent>
                {/* Order Header */}
                <Typography variant="h5" component="div" color="primary" gutterBottom>
                    Order ID: {orderId}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    User ID: {userId}
                </Typography>
                <Typography variant="body1" color={orderStatus === "pending" ? "orange" : "green"} fontWeight="bold">
                    Status: {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Order Items */}
                <Typography variant="h6" component="div" color="primary" gutterBottom>
                    Items:
                </Typography>
                <Grid container spacing={2}>
                    {items.map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '8px 16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                }}
                            >
                                <Typography variant="body2">Item ID: {item.itemId}</Typography>
                                <Typography variant="body2">Quantity: {item.quantity}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Order Details */}
                <Box sx={{ marginTop: '16px' }}>
                    <Typography variant="body1" color="text.secondary" fontWeight="bold">
                        Total Price: ${totalPrice}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ordered At: {new Date(orderedAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Completed At: {new Date(completedAt).toLocaleString()}
                    </Typography>
                </Box>

                {/* Action Buttons */}
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

                {/* Progress Bar */}
                <Box sx={{ marginTop: '20px' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        Time Remaining:
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} sx={{ marginTop: '8px' }} />
                </Box>
            </CardContent>
        </Card>
    );
};
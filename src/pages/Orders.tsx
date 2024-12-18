import { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
  TextField,
  Grid,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../store/hooks/hooks";
import { fetchOrders, updateOrderStatus } from "../store/slices/ordersSlice";
import { socket } from "../Layout";
import { Order } from "../store/slices/ordersSlice";

const Orders = () => {
  const { pendingOrders } = useAppSelector((state) => state.orders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedUserId, setSelectedUserId] = useState("");
  const socketOrder = useAppSelector(state=>state.socket.orderPage)
  const dispatch = useAppDispatch();

  // Get unique user IDs from orders
  const uniqueUserIds = Array.from(new Set(pendingOrders.map((order) => order.userId)));


  useEffect(() => {
    dispatch(fetchOrders());
    console.log(socketOrder)
  }, [socketOrder,dispatch]);

  useEffect(() => {
    let orders = [...pendingOrders];

    if (selectedUserId) {
      orders = orders.filter((order) => order.userId === selectedUserId);
    }

    if (sortField === "orderedAt") {
      orders.sort((a, b) => {
        const dateA = new Date(a.orderedAt).getTime();
        const dateB = new Date(b.orderedAt).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortField === "totalPreparationTime") {
      orders.sort((a, b) =>
        sortDirection === "asc"
          ? a.totalPreparationTime - b.totalPreparationTime
          : b.totalPreparationTime - a.totalPreparationTime
      );
    }

    setFilteredOrders(orders);
  }, [ pendingOrders, sortField, sortDirection, selectedUserId]);

  const handleClearFilters = () => {
    setSortField("");
    setSortDirection("asc");
    setSelectedUserId("");
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Total Pending Orders: {filteredOrders.length}
      </Typography>

      {/* Responsive Filter Section */}
      <Box sx={{ marginBottom: 2, width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <MenuItem value="orderedAt">Ordered At</MenuItem>
                <MenuItem value="totalPreparationTime">
                  Total Preparation Time
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort Direction</InputLabel>
              <Select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              options={uniqueUserIds}
              value={selectedUserId}
              onChange={(event, newValue) => setSelectedUserId(newValue || "")}
              renderInput={(params) => (
                <TextField {...params} label="Filter by User ID" variant="outlined" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleClearFilters}
            >
              Clear All Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {filteredOrders.map((order) => (
        <OrderComponent key={order.orderId} order={order} />
      ))}
    </div>
  );
};

interface OrderProps {
  order: Order;
}

const OrderComponent = ({ order }: OrderProps) => {
  const {
    orderId,
    userId,
    items,
    totalPrice,
    status,
    orderedAt,
    completedAt,
    totalPreparationTime,
  } = order;

  const initialTimeInSeconds = totalPreparationTime * 60;
  const [completionTime, setCompletionTime] = useState(initialTimeInSeconds);
  const [progress, setProgress] = useState(100);
  const [orderStatus, setOrderStatus] = useState(status);
  const dispatch = useAppDispatch();

  let timer: NodeJS.Timeout | undefined;

  useEffect(() => {
    if (orderStatus === "pending" && completionTime > 0) {
      timer = setInterval(() => {
        setCompletionTime((prevTime) => {
          if (prevTime === 1) {
            clearInterval(timer); // Stop the timer
            setOrderStatus("completed");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [orderStatus, completionTime]);

  useEffect(() => {
    setProgress((completionTime / initialTimeInSeconds) * 100); // Calculate progress
  }, [completionTime, initialTimeInSeconds]);

  const handleDelay = () => {
    setCompletionTime((prevTime) => prevTime + 5 * 60); // Add 5 minutes
  };

  const handleMarkCompleted = (orderId: string) => {
    setOrderStatus("completed");
    setCompletionTime(0);
    dispatch(updateOrderStatus({ orderId, status: "completed" }));
    socket.emit("order-update", "marking order as complete");
  };

  const formatDate = (date: string | undefined) => {
    return date ? new Date(date).toLocaleString() : "Not Available";
  };

  const formatTimeRemaining = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${String(seconds).padStart(2, "0")}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <Card sx={{ maxWidth: "100%", margin: "20px auto", borderRadius: "8px", boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" color="primary" gutterBottom>
          Order ID: {orderId}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            User ID: {userId}
          </Typography>
          <Button variant="outlined" color="primary">
            Call User
          </Button>
        </Box>
        <Typography
          variant="body1"
          color={orderStatus === "pending" ? "orange" : "green"}
          fontWeight="bold"
        >
          Status: {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" color="primary" gutterBottom>
          Items:
        </Typography>
        <TableContainer component={Paper} sx={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Item Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Price (₹)</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ marginTop: "16px" }}>
          <Typography variant="body1" color="text.secondary" fontWeight="bold">
            Total Price: ₹{totalPrice}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ordered At: {formatDate(orderedAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completed At: {formatDate(completedAt)}
          </Typography>
        </Box>

        <Box sx={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "center" }}>
          {orderStatus === "pending" && (
            <>
              <Button variant="contained" color="warning" onClick={handleDelay}>
                Delay by 5 mins
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleMarkCompleted(orderId)}
              >
                Mark as Completed
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ marginTop: "20px" }}>
          <Typography variant="body2" color="text.secondary" fontWeight="bold">
            Time Remaining: {formatTimeRemaining(completionTime)}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ marginTop: "8px" }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default Orders;
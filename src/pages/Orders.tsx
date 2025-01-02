import { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Button,
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
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../store/hooks/hooks";
import { fetchOrders, updateOrderStatus } from "../store/slices/ordersSlice";
import { Order } from "../store/slices/ordersSlice";
import { socket } from "../Layout";

const Orders = () => {
  const { pendingOrders } = useAppSelector((state) => state.orders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedUserName, setSelectedUserName] = useState("");
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notifications);
  const [orderCompletion, setOrderCompletion] = useState(0);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch, notifications, orderCompletion]);

  useEffect(() => {
    let orders = [...pendingOrders];

    if (selectedUserName) {
      orders = orders.filter((order) => order.userFullName === selectedUserName);
    }

    if (sortField === "orderedAt") {
      orders.sort((a, b) => {
        const dateA = new Date(a.orderedAt ?? "").getTime();
        const dateB = new Date(b.orderedAt ?? "").getTime();
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
  }, [pendingOrders, sortField, sortDirection, selectedUserName]);

  const handleClearFilters = () => {
    setSortField("");
    setSortDirection("asc");
    setSelectedUserName("");
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Pending Orders: {filteredOrders.length}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 2,
          padding: 2,
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          marginBottom: 3,
        }}
      >
        <FormControl>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            fullWidth
          >
            <MenuItem value="orderedAt">Ordered At</MenuItem>
            <MenuItem value="totalPreparationTime">Preparation Time</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <Select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="asc">↑ Asc</MenuItem>
            <MenuItem value="desc">↓ Desc</MenuItem>
          </Select>
        </FormControl>

        <Autocomplete
          options={Array.from(new Set(pendingOrders.map((order) => order.userFullName)))}
          value={selectedUserName}
          onChange={(_, newValue) => setSelectedUserName(newValue || "")}
          renderInput={(params) => <TextField {...params} label="User Names" variant="outlined" />}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleClearFilters}
        >
          ✖ Clear
        </Button>
      </Box>

      {filteredOrders.map((order, i) => (
        <OrderComponent
          setOrderCompletion={setOrderCompletion}
          key={order.orderId}
          order={order}
          index={i}
        />
      ))}
    </div>
  );
};

interface OrderProps {
  order: Order;
  index: number;
  setOrderCompletion: (prev: number | ((prev: number) => number)) => void;
}

const OrderComponent = ({ order, index, setOrderCompletion }: OrderProps) => {
  const { orderId, items, totalPrice, status, orderedAt, userFullName, cabinName, extraInfo, specialInstructions, userPhoneNumber } = order;

  const dispatch = useAppDispatch();

  const handleMarkCompleted = async (orderId: string) => {
    await dispatch(updateOrderStatus({ orderId, status: "completed" }));
    setOrderCompletion((prev) => prev + 1);
    socket.emit("orderNotification", { phoneNumber: userPhoneNumber, orderId, message: "completed" });
  };

  const formatDate = (date: string | undefined) => (date ? new Date(date).toLocaleString() : "Not Available");

  const makeCall = () => {
    window.location.href = `tel:${order.userPhoneNumber}`;
  };

  return (
    <Card sx={{ maxWidth: "100%", margin: "20px auto", borderRadius: "8px", boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" color="primary" gutterBottom>
          ({index + 1}). Name: {userFullName}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography>Order ID: {orderId}</Typography>
          <Button onClick={makeCall} variant="outlined" color="primary">
            Call User
          </Button>
        </Box>
        <Typography>Cabin No.: {cabinName}</Typography>
        <Typography>Extra Info: {extraInfo}</Typography>
        <Typography>Special Instructions: {specialInstructions}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Items:</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price (₹)</TableCell>
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
        <Typography>Total Price: ₹{totalPrice}</Typography>
        <Typography>Ordered At: {formatDate(orderedAt)}</Typography>
        {status === "pending" && (
          <Box sx={{ marginTop: "16px" }}>
            <Button variant="contained" color="success" onClick={() => handleMarkCompleted(orderId)}>
              Mark as Completed
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Orders;
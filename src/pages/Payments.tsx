import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../Layout";
import { useAppSelector } from "../store/hooks/hooks";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";

interface Payment {
  id: string;
  amount: number; // Total amount in paise
  amount_refunded: number; // Refunded amount in paise
  currency: string;
  status: "captured" | "refunded" | "partially_refunded";
  order_id:string;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [refundAmount, setRefundAmount] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const {kitchenId} = useAppSelector(state=>state.auth)
  // Fetch payments on load
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get<Payment[]>(`${apiUrl}/payments/${kitchenId}`);
        setPayments(response.data);
        setFilteredPayments(response.data);
      } catch (error: any) {
        console.error("Error fetching payments:", error.message || error);
      }
    };

    fetchPayments();
  }, []);

  const handleRefund = async (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const amount = refundAmount[paymentId]
      ? refundAmount[paymentId]
      : payment.amount - payment.amount_refunded; // Full refund if no amount is provided

    const availableRefund = payment.amount;

    console.log(availableRefund, amount*100)

    if (amount*100 > availableRefund) {
      setErrors((prev) => ({
        ...prev,
        [paymentId]: `Refund amount cannot exceed ₹${availableRefund / 100}.`,
      }));
      return;
    }

    try {
      const response = await axios.post<{ message: string; payment: Payment }>(
        `${apiUrl}/payments/refund`,
        {
          paymentId,
          refundAmount: amount*100,
        }
      );
      if(response.status==200){

        toast.success(`Refund successful! Amount: ₹${amount}`);

        
      }else{

        toast.error(`Refund failed! Please try again. Amount: ₹${amount}`);

      }
      setPayments((prevPayments) =>
        prevPayments.map((p) => (p.id === paymentId ? response.data.payment : p))
      );
      setFilteredPayments((prevFiltered) =>
        prevFiltered.map((p) => (p.id === paymentId ? response.data.payment : p))
      );
      setRefundAmount((prev) => ({ ...prev, [paymentId]: 0 }));
      setErrors((prev) => ({ ...prev, [paymentId]: "" }));
      setMessage(response.data.message);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  const handleRefundInput = (paymentId: string, value: number) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const availableRefund = payment.amount/100;

    if (value > availableRefund) {
      setErrors((prev) => ({
        ...prev,
        [paymentId]: `Refund amount cannot exceed ₹${availableRefund}.`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [paymentId]: "" }));
    }

    setRefundAmount((prev) => ({ ...prev, [paymentId]: value }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilter(value);

    if (value === "") {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter((payment) =>
        payment.id.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPayments(filtered);
    }
  };

  const handleClearFilter = () => {
    setFilter("");
    setFilteredPayments(payments);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Payments Management
      </h2>
      <ToastContainer />

      {/* Filter Input with Clear Button */}
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Filter by Payment ID"
          value={filter}
          onChange={handleFilterChange}
          style={{
            flex: 1,
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        {filter && (
          <button
            onClick={handleClearFilter}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {filteredPayments.length === 0 ? (
        <p>No payments found for the given filter.</p>
      ) : (
        filteredPayments.map((payment) => (
          <div
            key={payment.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              margin: "10px 0",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div>
              <strong>Payment ID:</strong> {payment.id}
            </div>
            <div>
              <strong>Order ID:</strong> {payment.order_id}
            </div>
            <div>
              <strong>Amount:</strong> ₹{payment.amount / 100} {payment.currency}
            </div>
            <div>
              <strong>Refunded Amount:</strong> ₹
              {payment.amount_refunded/100} {payment.currency}
            </div>
            <div>
              <strong>Status:</strong> {payment.status}
            </div>

            <div style={{ marginTop: "15px", display: "flex", flexDirection: "column" }}>
              <input
                type="number"
                placeholder="Enter refund amount"
                value={refundAmount[payment.id] || ""}
                onChange={(e) =>
                  handleRefundInput(payment.id, Number(e.target.value))
                }
                style={{
                  marginBottom: "5px",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              {errors[payment.id] && (
                <p style={{ color: "red", margin: "5px 0" }}>{errors[payment.id]}</p>
              )}
              <button
                onClick={() => handleRefund(payment.id)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Refund
              </button>
            </div>
          </div>
        ))
      )}

      {message && (
        <p style={{ marginTop: "20px", color: "green", textAlign: "center" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Payments;
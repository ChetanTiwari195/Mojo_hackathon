import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaymentState {
  customerName: string;
  amount: number;
}

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentState | undefined;

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-black">
        <p>Invalid payment data.</p>
      </div>
    );
  }

  const { customerName, amount } = state;

  const handlePayment = () => {
    // redirect to success page
    navigate("/payment-success", {
      state: { customerName, amount },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader>
          <CardTitle className="text-center text-xl">Razorpay Payment</CardTitle>
          <CardDescription className="text-center">
            Dummy Razorpay Payment Gateway
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>
            <span className="font-semibold">Customer Name:</span> {customerName}
          </p>
          <p>
            <span className="font-semibold">Amount:</span> ₹{amount}
          </p>
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={handlePayment}
          >
            Pay Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

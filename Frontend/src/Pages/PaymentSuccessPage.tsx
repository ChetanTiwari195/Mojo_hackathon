import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SuccessState {
  customerName: string;
  amount: number;
}

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SuccessState | undefined;

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        <p>Invalid payment data.</p>
      </div>
    );
  }

  const { customerName, amount } = state;

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Payment Successful!</CardTitle>
          <CardDescription className="text-center">Thank you for your payment.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>
            <span className="font-semibold">Customer Name:</span> {customerName}
          </p>
          <p>
            <span className="font-semibold">Amount Paid:</span> ₹{amount}
          </p>
          <Button
            className="mt-4 bg-black text-white hover:bg-gray-800"
            onClick={() => navigate("/")}
          >
            Back to Invoices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

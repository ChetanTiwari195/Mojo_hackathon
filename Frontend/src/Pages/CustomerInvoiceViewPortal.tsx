import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios"; // Import axios

interface Invoice {
  id: number;
  billNumber: string; // Use billNumber to match the backend model
  billDate: string; // Use billDate to match the backend model
  dueDate: string;
  totalAmount: number; // Use totalAmount to match the backend model
  status: "paid" | "posted"; // Use "paid" and "posted" to match the backend model
  customerName: string; // This will likely come from a nested object
}

export default function CustomerInvoicePortal() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a JWT from a context or local storage for authentication
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        // This is a hypothetical API endpoint to get all invoices for the logged-in user.
        // You would need to create this endpoint on your backend.
        const response = await axios.get(
          "http://localhost:8000/api/v1/invoices",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // The API response might return an array of invoice objects.
        // We'll need to map this to our Invoice interface.
        const apiData = response.data.data.map((item: any) => ({
          id: item.id,
          billNumber: item.billNumber,
          billDate: item.billDate,
          dueDate: item.dueDate,
          totalAmount: item.totalAmount,
          status: item.status,
          customerName: item.customer.contactName, // Assuming customer name is nested
        }));

        setInvoices(apiData);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || "Failed to fetch invoices.");
        } else {
          setError("An unexpected error occurred.");
        }
        console.error("Failed to fetch invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvoices();
    } else {
      setError("No authentication token found. Please log in.");
      setLoading(false);
    }
  }, [token]);

  const handlePayNow = (invoice: Invoice) => {
    navigate(`/payment/${invoice.id}`, {
      state: {
        customerName: invoice.customerName,
        amount: invoice.totalAmount, // Use totalAmount
      },
    });
  };

  // Conditionally render based on state
  if (loading) {
    return <div className="p-6 text-center">Loading invoices...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white text-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Customer Invoices</h1>
      <table className="w-full border border-black text-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Invoice #</th>
            <th className="border px-4 py-2">Invoice Date</th>
            <th className="border px-4 py-2">Due Date</th>
            <th className="border px-4 py-2">Amount Due</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr key={invoice.id} className="text-center">
                <td className="border px-4 py-2">{invoice.billNumber}</td>
                <td className="border px-4 py-2">{invoice.billDate}</td>
                <td className="border px-4 py-2">{invoice.dueDate}</td>
                <td className="border px-4 py-2">₹{invoice.totalAmount}</td>
                <td className="border px-4 py-2">
                  {invoice.status === "posted" ? (
                    <Button onClick={() => handlePayNow(invoice)}>
                      Pay Now
                    </Button>
                  ) : (
                    <span className="text-green-600 font-semibold">Paid</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-4">
                No invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

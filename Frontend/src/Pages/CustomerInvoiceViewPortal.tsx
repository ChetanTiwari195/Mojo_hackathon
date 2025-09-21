import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Invoice {
  id: number;
  invoice: string;
  invoiceDate: string;
  dueDate: string;
  amountDate: string;
  amountDue: number;
  status: "Paid" | "Pay Now";
  customerName: string;
}

export default function CustomerInvoicePortal() {
  const navigate = useNavigate();

  const invoices: Invoice[] = [
    {
      id: 1,
      invoice: "INV-001",
      invoiceDate: "2025-09-20",
      dueDate: "2025-10-20",
      amountDate: "2025-09-20",
      amountDue: 5000,
      status: "Pay Now",
      customerName: "Shivkumar",
    },
    {
      id: 2,
      invoice: "INV-002",
      invoiceDate: "2025-09-22",
      dueDate: "2025-10-22",
      amountDate: "2025-09-22",
      amountDue: 7000,
      status: "Paid",
      customerName: "Shivkumar",
    },
  ];

  const handlePayNow = (invoice: Invoice) => {
    navigate(`/payment/${invoice.id}`, {
      state: {
        customerName: invoice.customerName,
        amount: invoice.amountDue,
      },
    });
  };

  return (
    <div className="p-6 bg-white text-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Customer Invoices</h1>
      <table className="w-full border border-black text-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Invoice</th>
            <th className="border px-4 py-2">Invoice Date</th>
            <th className="border px-4 py-2">Due Date</th>
            <th className="border px-4 py-2">Amount Date</th>
            <th className="border px-4 py-2">Amount Due</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="text-center">
              <td className="border px-4 py-2">{invoice.invoice}</td>
              <td className="border px-4 py-2">{invoice.invoiceDate}</td>
              <td className="border px-4 py-2">{invoice.dueDate}</td>
              <td className="border px-4 py-2">{invoice.amountDate}</td>
              <td className="border px-4 py-2">₹{invoice.amountDue}</td>
              <td className="border px-4 py-2">
                {invoice.status === "Pay Now" ? (
                  <Button onClick={() => handlePayNow(invoice)}>Pay Now</Button>
                ) : (
                  "Paid"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

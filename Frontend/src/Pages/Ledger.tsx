import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// --- Updated Type Definition to match actual backend response ---
type Transaction = {
  partnerName: string;
  accountName: string;
  invoiceRef: string; // Your backend returns invoiceRef
  invoiceDate: string; // Your backend returns invoiceDate
  dueDate: string | null;
  amount: number;
  balance: number | null; // Your backend can return null for balance
};

// --- API Fetch Function using Axios ---
const fetchLedgerData = async (): Promise<Transaction[]> => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

  console.log(`Fetching ledger data from: ${apiUrl}/ledger`);

  try {
    const response = await axios.get(`${apiUrl}/ledger`);

    // Your backend returns data directly as an array
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("Expected array but got:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch ledger data:", error);
    return [];
  }
};

// --- Formatting Helper ---
const formatCurrency = (num: number | null | undefined): string => {
  if (num === null || num === undefined) {
    return "-";
  }
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
};

// --- The Main Transaction Ledger Component ---
function TransactionLedger() {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedData = await fetchLedgerData();
        setData(fetchedData);
      } catch (err) {
        setError("Failed to load transaction data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto my-10 font-sans p-4">
      {/* --- Top Navigation Buttons --- */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button variant="outline">Print</Button>
          <Button variant="outline">Send</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Home</Button>
          <Button variant="outline">Back</Button>
        </div>
      </div>
      <div className="flex items-center justify-end mb-4">
        <div className="flex gap-2">
          <Button variant="outline">Search</Button>
          <Button variant="outline">Date</Button>
          <Button variant="outline">Month</Button>
          <Button variant="outline">Year</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Ledger</CardTitle>
          <CardDescription>
            Showing all transactions as on {currentDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <p>Loading transaction data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96 text-red-500">
              <p>{error}</p>
            </div>
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Invoice / Bill Ref.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.partnerName}</TableCell>
                    <TableCell>{transaction.accountName}</TableCell>
                    <TableCell>{transaction.invoiceRef}</TableCell>
                    <TableCell>
                      {new Date(transaction.invoiceDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.dueDate
                        ? new Date(transaction.dueDate).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        transaction.amount < 0
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <p>No transaction data available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TransactionLedger;

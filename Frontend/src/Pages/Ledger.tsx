import { useState, useEffect } from "react";
import axios from "axios"; // 👈 Import Axios
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

// --- Type Definitions ---
type Transaction = {
  partnerName: string;
  accountName: string;
  invoiceRef: string;
  invoiceDate: string;
  dueDate: string | null;
  amount: number;
  balance: number | null;
};

// ❌ OLD: Dummy Fetch Function
// const fetchLedgerData = async (): Promise<Transaction[]> => { ... };

// ✅ NEW: Fetch function using Axios
const fetchLedgerData = async (): Promise<Transaction[]> => {
  console.log("Fetching ledger data from API using Axios...");
  try {
    const response = await axios.get("http://localhost:3000/api/ledger");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch ledger data:", error);
    throw error; // Re-throw to be caught by useEffect's catch block
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

// --- The Transaction Ledger Component ---
function TransactionLedger() {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const fetchedData = await fetchLedgerData();
        setData(fetchedData);
      } catch (error) {
        console.error("Failed to fetch ledger data:", error);
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
    <div className="max-w-7xl mx-auto my-10 font-sans">
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
          <CardTitle>Transaction Ledger</CardTitle>
          <CardDescription>
            Showing all transactions as on {currentDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <p>Loading transaction data...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Invoice / Bill Ref.</TableHead>
                  <TableHead>Invoice Date</TableHead>
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
                    <TableCell>{transaction.invoiceDate}</TableCell>
                    <TableCell>{transaction.dueDate || "-"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(transaction.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TransactionLedger;

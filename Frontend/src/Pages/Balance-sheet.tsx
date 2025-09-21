import { useState, useEffect } from "react";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";

// --- Type Definitions ---
// type LedgerEntry = {
//   account: string;
//   amount: number;
// };

// Based on the new controller, the data structure is different.
// We'll update the types to match the expected API response.
type BalanceSheetData = {
  assets: {
    total: number;
    details: {
      cashAndBank: number;
      accountsReceivable: number;
    };
  };
  liabilities: {
    total: number;
    details: {
      accountsPayable: number;
    };
  };
  equity: {
    total: number;
    details: {
      retainedEarnings: number;
    };
  };
  balance: number;
};

// --- Formatting Helpers ---
const formatCurrency = (num: number) => {
  if (typeof num !== "number") {
    return "N/A";
  }
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
};

// --- The Balance Sheet Component ---
function BalanceSheet() {
  // --- State Management ---
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching on Component Mount ---
  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Use axios to fetch data from the new balance sheet API endpoint
        const response = await axios.get<BalanceSheetData>(
          "http://localhost:8000/api/v1/balance-sheet"
        );
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch balance sheet data:", err);
        setError("Failed to load balance sheet data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Render Main Component ---
  return (
    <div className="max-w-4xl mx-auto my-10 font-sans">
      {/* --- Top Navigation Buttons --- */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button variant="outline">Print</Button>
          <Button variant="outline">Date</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Home</Button>
          <Button variant="outline">Back</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
          <CardDescription>
            {data
              ? `Assets = Liabilities + Equity`
              : "Loading balance sheet data..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading balance sheet data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- Liabilities & Equity Table --- */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Liabilities & Equity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Liabilities */}
                  <TableRow className="font-semibold bg-gray-100 dark:bg-gray-800">
                    <TableCell colSpan={2}>Liabilities</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Accounts Payable</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data.liabilities.details.accountsPayable)}
                    </TableCell>
                  </TableRow>
                  {/* Equity */}
                  <TableRow className="font-semibold bg-gray-100 dark:bg-gray-800">
                    <TableCell colSpan={2}>Equity</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Retained Earnings</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data.equity.details.retainedEarnings)}
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow className="font-bold">
                    <TableCell>Total Liabilities & Equity</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        data.liabilities.total + data.equity.total
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>

              {/* --- Assets Table --- */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assets</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Cash and Bank</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data.assets.details.cashAndBank)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Accounts Receivable</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data.assets.details.accountsReceivable)}
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow className="font-bold">
                    <TableCell>Total Assets</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data.assets.total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {data && (
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Balance Check: Assets - (Liabilities + Equity) ={" "}
          {formatCurrency(data.balance)}
        </p>
      )}
    </div>
  );
}

export default BalanceSheet;

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

// --- Type Definitions ---
type LedgerEntry = {
  account: string;
  amount: number;
};

type ProfitLossData = {
  expenses: LedgerEntry[];
  income: LedgerEntry[];
};

// --- Dummy Fetch Function ---
// This function simulates an API call to fetch the P&L data.
const fetchProfitLossData = async (): Promise<ProfitLossData> => {
  console.log("Fetching data from dummy API...");
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: ProfitLossData = {
        expenses: [
          { account: "Purchase Expense A/c", amount: 17857.5 },
          { account: "Other Expense A/c", amount: 0.0 },
        ],
        income: [{ account: "Sales Income A/c", amount: 23610 }],
      };
      resolve(mockData);
    }, 1000); // Simulate a 1-second network delay
  });
};

// --- Formatting Helpers ---
const formatCurrency = (num: number) => {
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
};

// --- The Profit & Loss Statement Component ---
function ProfitLossStatement() {
  // --- State Management ---
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- Data Fetching on Component Mount ---
  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const fetchedData = await fetchProfitLossData();
        setData(fetchedData);
      } catch (error) {
        console.error("Failed to fetch P&L data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  // --- Calculations ---
  const totalExpenses = data
    ? data.expenses.reduce((acc, item) => acc + item.amount, 0)
    : 0;
  const totalIncome = data
    ? data.income.reduce((acc, item) => acc + item.amount, 0)
    : 0;
  const netProfit = totalIncome - totalExpenses;
  const grandTotal = Math.max(
    totalIncome,
    totalExpenses + (netProfit > 0 ? netProfit : 0)
  );

  // Get the current date for the description
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto my-10 font-sans">
      {/* --- Top Navigation Buttons --- */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button variant="outline">Print</Button>
          <Button variant="outline">Date</Button>
          <Button variant="outline">Month</Button>
          <Button variant="outline">Year</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Home</Button>
          <Button variant="outline">Back</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
          <CardDescription>For the period ending {currentDate}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading P&L statement data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- Expenses Table --- */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expenses</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.expenses.map((item, index) => (
                    <TableRow key={`expense-${index}`}>
                      <TableCell>{item.account}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {netProfit > 0 && (
                    <TableRow>
                      <TableCell>Net Profit</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(netProfit)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>

              {/* --- Income Table --- */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Income</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.income.map((item, index) => (
                    <TableRow key={`income-${index}`}>
                      <TableCell>{item.account}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {netProfit < 0 && (
                    <TableRow>
                      <TableCell>Net Loss</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatCurrency(Math.abs(netProfit))}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfitLossStatement;

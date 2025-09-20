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

type BalanceSheetData = {
  netProfit: number;
  liabilities: LedgerEntry[];
  assets: LedgerEntry[];
};

// --- Dummy Fetch Function ---
// This function simulates an API call to fetch the balance sheet data.
const fetchBalanceSheetData = async (): Promise<BalanceSheetData> => {
  console.log("Fetching data from dummy API...");
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: BalanceSheetData = {
        netProfit: 5752.5,
        liabilities: [{ account: "Creditors A/c", amount: 0.0 }],
        assets: [
          { account: "Bank A/c", amount: 5752.5 },
          { account: "Cash A/c", amount: 0.0 },
          { account: "Debtors A/c", amount: 0.0 },
        ],
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

// --- The Balance Sheet Component ---
function BalanceSheet() {
  // --- State Management ---
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- Data Fetching on Component Mount ---
  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const fetchedData = await fetchBalanceSheetData();
        setData(fetchedData);
      } catch (error) {
        console.error("Failed to fetch balance sheet data:", error);
        // In a real app, you might set an error state here
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Calculations ---
  // These calculations are performed only after data has been successfully loaded.
  const totalLiabilities = data
    ? data.liabilities.reduce((acc, item) => acc + item.amount, 0) +
      data.netProfit
    : 0;
  const totalAssets = data
    ? data.assets.reduce((acc, item) => acc + item.amount, 0)
    : 0;

  // Get the current date for the description
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
          <CardDescription>As on {currentDate}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading balance sheet data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- Liabilities Table --- */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Liabilities</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Net Profit</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data.netProfit)}
                    </TableCell>
                  </TableRow>
                  {data.liabilities.map((item, index) => (
                    <TableRow key={`liability-${index}`}>
                      <TableCell>{item.account}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(totalLiabilities)}
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
                  {data.assets.map((item, index) => (
                    <TableRow key={`asset-${index}`}>
                      <TableCell>{item.account}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(totalAssets)}
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

export default BalanceSheet;

import { useState, useEffect } from "react";
import axios from "axios";

// --- Mock Card components for structure, styled with Tailwind CSS ---
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div
    className={`p-6 flex flex-row items-center justify-between space-y-0 pb-2 ${className}`}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3
    className={`tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400 ${className}`}
  >
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

// --- Type Definitions ---
type DashboardData = {
  sales: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  purchases: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  payments: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/dashboard-summary"
        );
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-gray-900">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back! Here's a quick overview of your business.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          {/* Total Sales Card */}
          <Card>
            <CardHeader>
              <CardTitle>TOTAL SALES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {formatCurrency(data?.sales?.last24Hours || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 24 hours
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {formatCurrency(data?.sales?.last7Days || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 7 Days
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {formatCurrency(data?.sales?.last30Days || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 30 Days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Purchase Card */}
          <Card>
            <CardHeader>
              <CardTitle>TOTAL PURCHASE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {formatCurrency(data?.purchases?.last24Hours || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 24 hours
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {formatCurrency(data?.purchases?.last7Days || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 7 Days
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {formatCurrency(data?.purchases?.last30Days || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 30 Days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Payment Card */}
          <Card>
            <CardHeader>
              <CardTitle>TOTAL PAYMENT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {formatCurrency(data?.payments?.last24Hours || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 24 hours
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {formatCurrency(data?.payments?.last7Days || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 7 Days
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {formatCurrency(data?.payments?.last30Days || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 30 Days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

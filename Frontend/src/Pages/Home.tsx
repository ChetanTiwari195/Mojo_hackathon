
// A simple icon component for the down arrow, similar to what you might find in lucide-react
const ArrowDownIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

// Mock Card components for structure, styled with Tailwind CSS
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

export default function Dashboard() {
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
          {/* Total Invoice Card */}
          <Card>
            <CardHeader>
              <CardTitle>TOTAL INVOICE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    ₹0
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 24 hours
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    ₹23610
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 7 Days
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    ₹23610
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
                    ₹0
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 24 hours
                  </p>
                  <div className="flex items-center justify-center text-red-500 mt-1">
                    <ArrowDownIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">83.33 %</span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    ₹17857
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 7 Days
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    ₹17857
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
                    ₹0
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 24 hours
                  </p>
                  <div className="flex items-center justify-center text-red-500 mt-1">
                    <ArrowDownIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">80.00 %</span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    ₹5752
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 7 Days
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    ₹5752
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

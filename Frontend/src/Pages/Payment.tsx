import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Receipt } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

// --- Zod Schema for Payment Form ---
const paymentSchema = z.object({
  paymentNumber: z.string().optional(),
  paymentType: z.enum(["send", "receive"]),
  date: z.date({
    message: "A Payment date is required.",
  }),
  partnerType: z.enum(["customer", "vendor"]),
  journalId: z.coerce.number().min(1, "Payment method is required."),
  partner: z.string(),
  note: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive."),
  vendorBillId: z.number().optional(), // To link the payment to the bill
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface Account {
  id: number;
  accountName: string;
  accountType: string;
}

// Helper function to format date for input
function formatDateForInput(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function PaymentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const billData = location.state?.billData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [journals, setJournals] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with safe, empty defaults.
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: "send",
      date: new Date(),
      partnerType: "vendor",
      partner: "", // Default to an empty string
      note: "",
      amount: 0,
      vendorBillId: undefined,
      journalId: undefined,
    },
  });

  // Use this effect to populate form values once billData is available.
  useEffect(() => {
    if (billData) {
      form.reset({
        paymentType: "send",
        partnerType: "vendor",
        partner: billData.vendorName,
        amount: billData.totalAmount,
        vendorBillId: billData.vendorBillId,
        date: new Date(),
        // You can set a default journal here if you wish, e.g., journals[0]?.id
        journalId: journals.length > 0 ? journals[0].id : undefined,
        note: `Payment for ${billData.billNumber || "Vendor Bill"}`,
      });
    }
  }, [billData, form, journals]); // Add 'journals' to the dependency array

  // Fetch journals (asset accounts) for the dropdown
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/accounts");
        const assetAccounts = res.data.data.filter(
          (acc: Account) => acc.accountType === "Assets"
        );
        setJournals(assetAccounts);
        setIsLoading(false);
      } catch (err) {
        toast.error("Failed to load payment methods.");
        console.error("Error fetching accounts:", err);
        setIsLoading(false);
      }
    };

    fetchJournals();
  }, []);

  async function onSubmit(values: PaymentFormValues) {
    setIsSubmitting(true);

    const payload = {
      vendorBillId: values.vendorBillId,
      paymentDate: values.date,
      journalId: values.journalId,
      note: values.note,
      amount: values.amount,
    };

    try {
      await axios.post("http://localhost:8000/api/v1/vendor-payments", payload);

      toast.success("Bill paid successfully!");
      navigate("/");
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.response?.data?.error || "Failed to process payment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // If no bill data, redirect back
  useEffect(() => {
    if (!billData) {
      toast.error("No bill data found. Please select a bill to pay.");
      navigate(-1);
    }
  }, [billData, navigate]);

  if (!billData) {
    return (
      <div className="max-w-6xl mx-auto my-10 font-sans p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-10 font-sans p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              New Payment
            </h1>
            <p className="text-sm text-gray-600">
              Pay bill for {billData.vendorName} - Amount: ${" "}
              {billData.totalAmount?.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">
            Bill: {billData.billNumber}
          </span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 font-medium flex items-center disabled:opacity-50"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Processing..." : "Confirm Payment"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <div className="p-6 border border-gray-200 rounded-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Type
              </label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="send"
                    {...form.register("paymentType")}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    disabled
                  />
                  <span className="ml-2 text-sm text-gray-700">Send Money</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="receive"
                    {...form.register("paymentType")}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    disabled
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Receive Money
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                {...form.register("date", {
                  setValueAs: (v) => (v ? new Date(v) : new Date()),
                })}
                defaultValue={formatDateForInput(form.getValues("date"))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              {form.formState.errors.date && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partner Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Partner Type
              </label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="customer"
                    {...form.register("partnerType")}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    disabled
                  />
                  <span className="ml-2 text-sm text-gray-700">Customer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="vendor"
                    {...form.register("partnerType")}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    disabled
                  />
                  <span className="ml-2 text-sm text-gray-700">Vendor</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Via
              </label>
              <select
                {...form.register("journalId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                {isLoading ? (
                  <option value="">Loading methods...</option>
                ) : (
                  <>
                    <option value="">Select Payment Method...</option>
                    {journals.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.accountName}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {form.formState.errors.journalId && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.journalId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partner/Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name
              </label>
              <input
                type="text"
                {...form.register("partner")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  {...form.register("amount")}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-lg font-semibold bg-gray-100 cursor-not-allowed"
                  readOnly
                />
              </div>
              {form.formState.errors.amount && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Note
            </label>
            <textarea
              {...form.register("note")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Add a note about this payment..."
            />
          </div>

          {/* Bill Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Bill Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bill Number:</span>
                <span className="font-medium">{billData.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vendor:</span>
                <span className="font-medium">{billData.vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bill ID:</span>
                <span className="font-medium">#{billData.vendorBillId}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="font-bold text-lg">
                  ${billData.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Validation Errors */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Please fix the following errors:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(form.formState.errors).map(([key, error]) => (
                <li key={key}>• {error?.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Actions - Repeated for better UX */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 font-medium flex items-center disabled:opacity-50"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Processing Payment..." : "Confirm Payment"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Amount to pay:{" "}
            <span className="font-semibold">
              ${billData.totalAmount?.toFixed(2)}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PaymentForm;

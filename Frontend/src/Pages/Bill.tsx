import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, XCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

// --- Zod Schema Definitions ---
const lineItemSchema = z.object({
  productId: z.number(),
  productName: z.string().min(1, "Product name is required."),
  hsnNo: z.string().optional(),
  accountId: z.number().min(1, "Account is required."),
  quantity: z.coerce.number().positive("Qty must be positive."),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative."),
  taxRate: z.coerce.number().min(0, "Tax cannot be negative.").max(100),
});

// Use `z.string()` for date inputs and transform it for validation.
// This perfectly matches how HTML <input type="date"> works.
const vendorBillSchema = z.object({
  purchaseOrderId: z.number().optional(),
  billNumber: z.string().optional(),
  billDate: z.string().min(1, "Bill date is required."),
  dueDate: z.string().min(1, "Due date is required."),
  vendorName: z.string().min(2, "Vendor name is required."),
  billReference: z.string().optional(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "You must add at least one line item to the bill."),
});

// The form values will have dates as strings, matching the input elements.
type VendorBillFormValues = z.infer<typeof vendorBillSchema>;

// --- API Interfaces ---
interface Account {
  id: number;
  accountName: string;
}

// --- Helper Function ---
function formatDateForInput(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// --- React Component ---
function VendorBillForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const poData = location.state?.poData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const form = useForm<VendorBillFormValues>({
    resolver: zodResolver(vendorBillSchema),
    defaultValues: {
      billNumber: "Bill/2025/0001",
      billDate: formatDateForInput(new Date()), // Use formatted string
      dueDate: formatDateForInput(new Date()), // Use formatted string
      vendorName: "",
      billReference: "",
      lineItems: [],
    },
  });

  // --- Data Fetching and Initialization ---
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/accounts")
      .then((res) => setAccounts(res.data.data))
      .catch(() => toast.error("Failed to load accounts."));
  }, []);

  useEffect(() => {
    if (poData && accounts.length > 0) {
      const purchaseExpenseAccount = accounts.find(
        (a) => a.accountName === "Purchase Expense A/c"
      );
      form.reset({
        purchaseOrderId: poData.purchaseOrderId,
        vendorName: poData.vendorName,
        billReference: poAta.billReference,
        lineItems: poData.lineItems.map((item: any) => ({
          ...item,
          productId: item.productId,
          accountId: purchaseExpenseAccount?.id || 0,
        })),
        billDate: formatDateForInput(new Date()),
        dueDate: formatDateForInput(new Date()),
        billNumber: "Bill/2025/0001",
      });
    }
  }, [poData, form, accounts]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  // --- Calculations ---
  const watchedLineItems = form.watch("lineItems");
  const totals = React.useMemo(() => {
    return watchedLineItems.reduce(
      (acc, item) => {
        const untaxedAmount = (item.quantity || 0) * (item.unitPrice || 0);
        const taxAmount = untaxedAmount * ((item.taxRate || 0) / 100);
        acc.untaxed += untaxedAmount;
        acc.tax += taxAmount;
        acc.total += untaxedAmount + taxAmount;
        return acc;
      },
      { untaxed: 0, tax: 0, total: 0 }
    );
  }, [watchedLineItems]);

  // --- Form Submission ---
  async function onSubmit(values: VendorBillFormValues) {
    setIsSubmitting(true);

    const payload = {
      purchaseOrderId: values.purchaseOrderId,
      // The backend expects Date objects, so we convert the strings back here
      billDate: new Date(values.billDate),
      dueDate: new Date(values.dueDate),
      billReference: values.billReference,
      lines: values.lineItems.map((line) => ({
        productId: line.productId,
        accountId: line.accountId,
      })),
    };

    console.log("Submitting payload:", payload);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/vendor-bills",
        payload
      );

      const billData = response.data.data;
      toast.success(
        `Bill ${billData.billNumber} created. Proceeding to payment...`
      );

      navigate("/payment", {
        state: {
          billData: {
            vendorBillId: billData.id,
            contactId: billData.contactId,
            vendorName: values.vendorName,
            totalAmount: totals.total,
          },
        },
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create Vendor Bill.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Log errors to the console for easy debugging
  useEffect(() => {
    const subscription = form.watch(() => {
      console.log("Form errors:", form.formState.errors);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form.formState.errors]);

  return (
    <div className="max-w-7xl mx-auto my-10 font-sans p-4 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h1 className="text-2xl font-semibold text-gray-800">
          New Vendor Bill
        </h1>
        {/* Navigation buttons */}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Top Form Section (Vendor Info, Dates) */}
        <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Bill No.
              </label>
              <input
                type="text"
                {...form.register("billNumber")}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                {...form.register("vendorName")}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              {form.formState.errors.vendorName && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.vendorName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Reference
              </label>
              <input
                type="text"
                {...form.register("billReference")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., SUP-25-001"
              />
            </div>
          </div>
          {/* Right Column */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Date
              </label>
              <input
                type="date"
                {...form.register("billDate")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {form.formState.errors.billDate && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.billDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                {...form.register("dueDate")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {form.formState.errors.dueDate && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.dueDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border rounded-lg overflow-x-auto">
          {/* Table implementation */}
        </div>

        {/* General error message for the lineItems array */}
        {form.formState.errors.lineItems &&
          !Array.isArray(form.formState.errors.lineItems) && (
            <p className="text-sm font-semibold text-red-600">
              {form.formState.errors.lineItems.message}
            </p>
          )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 ..."
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Creating Bill..." : "Confirm"}
            </button>
            {/* Other buttons like Print, Cancel */}
          </div>
        </div>
      </form>
    </div>
  );
}

export default VendorBillForm;

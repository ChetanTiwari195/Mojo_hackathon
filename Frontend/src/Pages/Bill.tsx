import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, XCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

// --- Zod Schema for Line Items and the Main Form ---
const lineItemSchema = z.object({
  productId: z.number(), // Keep track of the original product ID
  productName: z.string().min(1, "Product name is required."),
  hsnNo: z.string().optional(),
  accountId: z.number().min(1, "Account is required."),
  quantity: z.coerce.number().positive("Qty must be positive."),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative."),
  taxRate: z.coerce.number().min(0, "Tax cannot be negative.").max(100),
});

// Fixed Zod Schema for dates
const vendorBillSchema = z.object({
  purchaseOrderId: z.number().optional(),
  billNumber: z.string().optional(),
  billDate: z
    .string()
    .min(1, "Bill date is required.")
    .transform((str) => new Date(str)),
  dueDate: z
    .string()
    .min(1, "Due date is required.")
    .transform((str) => new Date(str)),
  vendorName: z.string().min(2, "Vendor name is required."),
  billReference: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "Please add at least one product."),
});

type VendorBillFormValues = z.infer<typeof vendorBillSchema>;

// --- API Interfaces ---
interface Account {
  id: number;
  accountName: string;
}

// Move formatDateForInput function outside and above the component
function formatDateForInput(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
      billDate: formatDateForInput(new Date()),
      dueDate: formatDateForInput(new Date()),
      vendorName: "",
      billReference: "",
      lineItems: [],
    },
  });

  // Fetch accounts for the dropdown
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/accounts")
      .then((res) => setAccounts(res.data.data))
      .catch(() => toast.error("Failed to load accounts."));
  }, []);

  // Populate form from Purchase Order data
  useEffect(() => {
    if (poData && accounts.length > 0) {
      // Ensure accounts are loaded first
      const purchaseExpenseAccount = accounts.find(
        (a) => a.accountName === "Purchase Expense A/c"
      );
      form.reset({
        purchaseOrderId: poData.purchaseOrderId,
        vendorName: poData.vendorName,
        billReference: poData.billReference,
        lineItems: poData.lineItems.map((item: any) => ({
          ...item,
          productId: item.productId, // Ensure productId is passed
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

  async function onSubmit(values: VendorBillFormValues) {
    console.log("slkfjsdlj");
    setIsSubmitting(true);

    const payload = {
      contactId: poData?.contactId, // Ensure contactId comes from poData
      purchaseOrderId: values.purchaseOrderId,
      billDate: values.billDate,
      dueDate: values.dueDate,
      billReference: values.billReference,
      totalAmount: totals.total,
      lines: values.lineItems.map((line) => ({
        productId: line.productId,
        accountId: line.accountId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
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

      // Navigate to payment page with bill data
      navigate("/payment", {
        state: {
          billData: {
            vendorBillId: billData.id,
            contactId: billData.contactId,
            vendorName: values.vendorName,
            totalAmount: totals.total,
            billNumber: billData.billNumber,
          },
        },
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create Vendor Bill.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto my-10 font-sans p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h1 className="text-2xl font-semibold text-gray-800">
          New Vendor Bill
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium"
          >
            Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium"
          >
            Back
          </button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                readOnly
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

        <div className="border rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HSN
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Untaxed Amount
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Amount
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fields.map((item, index) => {
                const {
                  quantity = 0,
                  unitPrice = 0,
                  taxRate = 0,
                } = watchedLineItems[index] || {};
                const untaxedAmount = quantity * unitPrice;
                const taxAmount = untaxedAmount * (taxRate / 100);
                const totalAmount = untaxedAmount + taxAmount;
                const errors = form.formState.errors.lineItems?.[index];

                return (
                  <tr key={item.id}>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[200px]">
                      <input
                        type="text"
                        {...form.register(`lineItems.${index}.productName`)}
                        className="w-full px-2 py-1 border rounded text-sm bg-gray-100"
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap w-28">
                      <input
                        type="text"
                        {...form.register(`lineItems.${index}.hsnNo`)}
                        className="w-full px-2 py-1 border rounded text-sm bg-gray-100"
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[200px]">
                      <select
                        {...form.register(`lineItems.${index}.accountId`, {
                          setValueAs: (v) => parseInt(v),
                        })}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.accountName}
                          </option>
                        ))}
                      </select>
                      {errors?.accountId && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.accountId.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap w-24">
                      <input
                        type="number"
                        {...form.register(`lineItems.${index}.quantity`)}
                        className="w-full px-2 py-1 border rounded text-sm bg-gray-100"
                        readOnly
                      />
                      {errors?.quantity && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.quantity.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap w-32">
                      <input
                        type="number"
                        step="0.01"
                        {...form.register(`lineItems.${index}.unitPrice`)}
                        className="w-full px-2 py-1 border rounded text-sm bg-gray-100"
                        readOnly
                      />
                      {errors?.unitPrice && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.unitPrice.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {untaxedAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap w-32">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          {...form.register(`lineItems.${index}.taxRate`)}
                          className="w-16 px-2 py-1 border rounded text-sm bg-gray-100"
                          readOnly
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {taxAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      {totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="p-3 border-t bg-gray-50">
            <button
              type="button"
              onClick={() =>
                append({
                  productId: 0,
                  productName: "",
                  hsnNo: "",
                  accountId:
                    accounts.find(
                      (a) => a.accountName === "Purchase Expense A/c"
                    )?.id || 0,
                  quantity: 1,
                  unitPrice: 0,
                  taxRate: 0,
                })
              }
              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add a line
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 p-4 bg-gray-50 border-t-2 gap-y-2">
            <div className="col-start-1 md:col-start-3 text-sm font-medium text-gray-600">
              Untaxed Amount:
            </div>
            <div className="text-right text-sm font-medium text-gray-800">
              {totals.untaxed.toFixed(2)}
            </div>
            <div className="col-start-1 md:col-start-3 text-sm font-medium text-gray-600">
              Taxes:
            </div>
            <div className="text-right text-sm font-medium text-gray-800">
              {totals.tax.toFixed(2)}
            </div>
            <div className="col-start-1 md:col-start-3 mt-2 pt-2 border-t text-base font-bold text-gray-800">
              Total:
            </div>
            <div className="mt-2 pt-2 border-t text-right text-base font-bold text-gray-800">
              {totals.total.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Better root error message display */}
        {form.formState.errors.lineItems?.root && (
          <p className="text-sm font-semibold text-red-600 mt-4 p-2 bg-red-50 rounded-md">
            {form.formState.errors.lineItems.root.message}
          </p>
        )}
        {typeof form.formState.errors.lineItems === "object" &&
          !Array.isArray(form.formState.errors.lineItems) &&
          form.formState.errors.lineItems?.message && (
            <p className="text-sm font-semibold text-red-600 mt-4 p-2 bg-red-50 rounded-md">
              {form.formState.errors.lineItems.message}
            </p>
          )}

        <div className="flex items-center justify-between mt-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 text-sm font-semibold flex items-center"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Creating Bill..." : "Confirm"}
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium"
            >
              Print
            </button>
            <button
              type="button"
              onClick={() => form.reset()}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default VendorBillForm;

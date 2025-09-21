import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, XCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// --- Type Definitions ---
type Account = {
  id: number;
  accountName: string;
};

// --- Zod Schema for Line Items and the Main Form ---
const lineItemSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  hsnNo: z.string().optional(),
  accountName: z.string().min(1, "Account name is required."),
  quantity: z.coerce.number().positive("Qty must be positive."),
  unitPrice: z.coerce.number().positive("Price must be positive."),
  taxRate: z.coerce.number().min(0, "Tax cannot be negative.").max(100),
});

const salesBillSchema = z.object({
  salesOrderId: z.number().optional().nullable(),
  billDate: z.date({
    message: "A Bill date is required.",
  }),
  dueDate: z.date({
    message: "A Due date is required.",
  }),
  customerName: z.string().min(2, "Customer name is required."),
  billReference: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "Please add at least one product."),
});

type SalesBillFormValues = z.infer<typeof salesBillSchema>;

// Helper function to format date for input
const formatDateForInput = (date: Date): string => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function SalesBillForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  // Changed poData to soData (Sales Order Data)
  const soData = location.state?.soData;

  const form = useForm<SalesBillFormValues>({
    resolver: zodResolver(salesBillSchema),
    defaultValues: {
      salesOrderId: null,
      billDate: new Date(),
      dueDate: new Date(),
      customerName: "",
      billReference: "",
      lineItems: [
        {
          productName: "",
          hsnNo: "",
          accountName: "", // Adjusted default account
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
        },
      ],
    },
  });

  // --- Fetch Accounts from API on component mount ---
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/accounts"
        );
        setAccounts(response.data.data);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setIsLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  // Effect to populate the form if data is passed from the sales order form
  useEffect(() => {
    if (soData && !isInitialized) {
      form.reset({
        salesOrderId: soData.salesOrderId,
        customerName: soData.customerName,
        billReference: soData.billReference,
        lineItems: soData.lineItems,
        billDate: new Date(),
        dueDate: new Date(),
      });
      setIsInitialized(true);
    }
  }, [soData, form, isInitialized]);

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

  async function onSubmit(values: SalesBillFormValues) {
    setIsSubmitting(true);
    setSubmitMessage({ type: "", text: "" });

    // The backend `createSalesBill` controller will calculate the totalAmount,
    // so we don't need to send it. We'll send the raw lineItems.
    const payload = {
      customerName: values.customerName,
      billDate: formatDateForInput(values.billDate),
      dueDate: formatDateForInput(values.dueDate),
      billReference: values.billReference,
      lineItems: values.lineItems, // Send the full line items array
      salesOrderId: values.salesOrderId,
    };

    try {
      // Corrected API endpoint for sales bills
      const response = await axios.post(
        "http://localhost:8000/api/v1/sales/bills",
        payload
      );

      const result = response.data.data;

      setSubmitMessage({
        type: "success",
        text: "Sales Bill created successfully!",
      });

      // Navigate to the payment page and pass the newly created bill data
      navigate("/salespayment", {
        state: {
          billData: {
            salesBillId: result.id,
            billNumber: result.billNumber,
            customerName: values.customerName,
            totalAmount: result.totalAmount,
          },
        },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.message ||
        "An unknown error occurred.";
      setSubmitMessage({
        type: "error",
        text: `Submission failed: ${errorMessage}`,
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto my-10 font-sans p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">New Sales Bill</h1>
          {form.getValues("salesOrderId") && (
            <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
              From Sales Order
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-md bg-white hover:bg-gray-100 transition-colors">
            Back
          </button>
        </div>
      </div>

      {submitMessage.text && (
        <div
          className={`p-4 mb-4 rounded-md text-sm ${
            submitMessage.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-6 border rounded-lg flex flex-col md:flex-row justify-between gap-6 bg-white shadow-sm">
          <div className="flex flex-col gap-6 w-full">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Bill No.
              </label>
              <input
                type="text"
                value="Bill/2025/XXXX" // Value is now generated by the backend
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                {...form.register("customerName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="Select or enter a customer name..."
              />
              {form.formState.errors.customerName && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Reference
              </label>
              <input
                type="text"
                {...form.register("billReference")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., CUST-25-001"
              />
            </div>
          </div>

          <div className="w-full flex flex-col gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Date
              </label>
              <input
                type="date"
                {...form.register("billDate", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
                defaultValue={formatDateForInput(form.getValues("billDate"))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                {...form.register("dueDate", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
                defaultValue={formatDateForInput(form.getValues("dueDate"))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Confirm"}
            </button>
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto bg-white shadow-sm">
          <div className="min-w-[1024px]">
            <div className="grid grid-cols-14 gap-2 p-3 bg-gray-100 font-semibold text-sm border-b text-gray-600">
              <div className="col-span-1">Sr.</div>
              <div className="col-span-2">Product</div>
              <div className="col-span-1">HSN</div>
              <div className="col-span-2">Account</div>
              <div className="col-span-1 text-right">Qty</div>
              <div className="col-span-1 text-right">Price</div>
              <div className="col-span-2 text-right">Untaxed</div>
              <div className="col-span-1">Tax</div>
              <div className="col-span-2 text-right">Tax Amt.</div>
              <div className="col-span-1 text-right font-bold">Total</div>
            </div>

            <div className="divide-y">
              {fields.map((item, index) => {
                const {
                  quantity = 0,
                  unitPrice = 0,
                  taxRate = 0,
                } = watchedLineItems[index] || {};
                const untaxedAmount = quantity * unitPrice;
                const taxAmount = untaxedAmount * (taxRate / 100);
                const totalAmount = untaxedAmount + taxAmount;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-14 gap-2 p-3 items-center"
                  >
                    <div className="col-span-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                        disabled={fields.length <= 1}
                      >
                        <XCircle size={18} />
                      </button>
                      <span className="text-gray-600 font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        {...form.register(`lineItems.${index}.productName`)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Product name"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        {...form.register(`lineItems.${index}.hsnNo`)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="HSN"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        {...form.register(`lineItems.${index}.accountName`)}
                        className="w-full px-2 py-1 border rounded text-sm bg-white"
                      >
                        {isLoadingAccounts ? (
                          <option>Loading accounts...</option>
                        ) : (
                          accounts.map((account) => (
                            <option
                              key={account.id}
                              value={account.accountName}
                            >
                              {account.accountName}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        {...form.register(`lineItems.${index}.quantity`)}
                        className="w-full px-2 py-1 border rounded text-sm text-right"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        {...form.register(`lineItems.${index}.unitPrice`)}
                        className="w-full px-2 py-1 border rounded text-sm text-right"
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-medium text-gray-800">
                        {untaxedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          {...form.register(`lineItems.${index}.taxRate`)}
                          className="w-full px-2 py-1 border rounded text-sm text-right"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm text-gray-800">
                        {taxAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t bg-gray-50">
              <button
                type="button"
                onClick={() =>
                  append({
                    productName: "",
                    hsnNo: "",
                    accountName: accounts.length > 0 ? "Sales Income A/c" : "",
                    quantity: 1,
                    unitPrice: 0,
                    taxRate: 0,
                  })
                }
                className="text-purple-600 hover:text-purple-800 text-sm font-semibold flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Add a line
              </button>
            </div>

            <div className="grid grid-cols-14 gap-2 p-4 bg-gray-100 border-t-2">
              <div className="col-start-7 col-span-2 text-right font-semibold">
                Total
              </div>
              <div className="col-span-2 text-right font-semibold text-gray-800">
                {totals.untaxed.toFixed(2)}
              </div>
              <div className="col-span-2 text-right font-semibold text-gray-800">
                {totals.tax.toFixed(2)}
              </div>
              <div className="col-span-2 text-right">
                <div className="border-2 border-gray-400 rounded-md px-2 py-1 bg-white font-bold text-gray-900">
                  {totals.total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {form.formState.errors.lineItems?.message && (
          <p className="text-sm text-red-500">
            {form.formState.errors.lineItems.message}
          </p>
        )}
      </form>
    </div>
  );
}

export default SalesBillForm;

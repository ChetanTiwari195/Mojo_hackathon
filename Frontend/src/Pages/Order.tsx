import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, PlusCircle, XCircle } from "lucide-react";
import axios from "axios";

// --- Zod Schema for Line Items and the Main Form ---
const lineItemSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  quantity: z.coerce.number().positive("Qty must be positive."),
  unitPrice: z.coerce.number().positive("Price must be positive."),
  taxRate: z.coerce.number().min(0, "Tax cannot be negative.").max(100),
});

const purchaseOrderSchema = z.object({
  poNumber: z.string().optional(),
  poDate: z.date({
    message: "A PO date is required.",
  }),
  vendorId: z.string().min(1, "Vendor is required."),
  reference: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "Please add at least one product."),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

// Vendor interface
interface Vendor {
  id: number;
  contactName: string;
  email: string;
  phone: string;
}

function PurchaseOrderForm() {
  // State for holding vendor data and loading status
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  // Effect to fetch vendors when the component mounts
  useEffect(() => {
    const fetchVendors = async () => {
      setLoadingVendors(true);
      try {
        // Fetch vendors from the backend API using the getAllContacts endpoint
        const response = await axios.get("/api/v1/contacts?type=vendor");

        // The backend controller wraps the array in a 'data' object
        if (response.data && Array.isArray(response.data.data)) {
          setVendors(response.data.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setVendors([]);
        }
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
        // Optionally, set an error state here to show in the UI
        setVendors([]); // Clear vendors on error
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []); // Empty dependency array ensures this runs only once on mount

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      poNumber: "P00001",
      poDate: new Date(),
      vendorId: "", // Corrected this from 'vendorName' to match schema
      reference: "",
      lineItems: [
        { productName: "", quantity: 1, unitPrice: 0, taxRate: 0 }, // Set qty to 1 to pass validation by default
      ],
    },
  });

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

  function onSubmit(values: PurchaseOrderFormValues) {
    console.log("Purchase Order Submitted:", {
      ...values,
      totals,
    });
    alert("PO submitted successfully! Check the console for the form data.");
  }

  // Helper to format date for the input defaultValue
  const formatDateForInput = (date: Date) => {
    if (!date) return "";
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split("T")[0];
  };

  return (
    <div className="max-w-7xl mx-auto my-10 font-sans p-4 bg-white rounded-lg shadow-sm">
      {/* --- Top Navigation Buttons --- */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h1 className="text-2xl font-semibold text-gray-800">
          New Purchase Order
        </h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium">
            Home
          </button>
          <button className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium">
            Back
          </button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- PO Header Section --- */}
        <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {/* PO Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO No.
              </label>
              <input
                type="text"
                value={form.getValues("poNumber")}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Vendor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name
              </label>
              <select
                {...form.register("vendorId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                disabled={loadingVendors}
              >
                <option value="">
                  {loadingVendors ? "Loading vendors..." : "Select a vendor"}
                </option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.contactName}
                  </option>
                ))}
              </select>
              {form.formState.errors.vendorId && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.vendorId.message}
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {/* PO Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Date
              </label>
              <input
                type="date"
                defaultValue={formatDateForInput(form.getValues("poDate"))}
                {...form.register("poDate", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              {form.formState.errors.poDate && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.poDate.message}
                </p>
              )}
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                {...form.register("reference")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., REQ-25-0001"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* --- Action Bar --- */}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 text-sm font-semibold"
            >
              Confirm
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium"
            >
              Print
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => form.reset()}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium"
            >
              Cancel
            </button>
          </div>

          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span>Draft</span>
            <ChevronRight size={16} />
            <span className="font-semibold text-purple-600">Confirm</span>
            <ChevronRight size={16} />
            <span>Billed</span>
            <ChevronRight size={16} />
            <span>Cancelled</span>
          </div>
        </div>

        {/* --- Line Items Table --- */}
        <div className="border rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sr.
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fields.map((item, index) => {
                const quantity = watchedLineItems[index]?.quantity || 0;
                const unitPrice = watchedLineItems[index]?.unitPrice || 0;
                const subtotal = quantity * unitPrice;
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[200px]">
                      <input
                        type="text"
                        {...form.register(`lineItems.${index}.productName`)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Product name"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap w-24">
                      <input
                        type="number"
                        {...form.register(`lineItems.${index}.quantity`)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap w-32">
                      <input
                        type="number"
                        step="0.01"
                        {...form.register(`lineItems.${index}.unitPrice`)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap w-32">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          {...form.register(`lineItems.${index}.taxRate`)}
                          className="w-16 px-2 py-1 border rounded text-sm"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {subtotal.toFixed(2)}
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

          {/* Add New Line Button */}
          <div className="p-3 border-t bg-gray-50">
            <button
              type="button"
              onClick={() =>
                append({
                  productName: "",
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

          {/* Totals Section */}
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

        {form.formState.errors.lineItems?.message && (
          <p className="text-sm text-red-500">
            {form.formState.errors.lineItems.message}
          </p>
        )}
      </form>
    </div>
  );
}

export default PurchaseOrderForm;

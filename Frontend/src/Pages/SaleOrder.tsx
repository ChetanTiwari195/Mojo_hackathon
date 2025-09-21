import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, XCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// --- Zod Schema for Line Items and the Main Form ---
const lineItemSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  quantity: z.coerce.number().positive("Qty must be positive."),
  unitPrice: z.coerce.number().positive("Price must be positive."),
  taxRate: z.coerce.number().min(0, "Tax cannot be negative.").max(100),
});

const salesOrderSchema = z.object({
  soNumber: z.string().optional(),
  soDate: z.date({
    message: "A sales order date is required.",
  }),
  customerId: z.string().min(1, "Customer is required."),
  reference: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "Please add at least one product."),
});

type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;

// --- API Interfaces ---
interface Customer {
  id: number;
  contactName: string;
}

interface Product {
  id: number;
  productName: string;
  salesPrice: number;
  salesTax: number;
  hsnCode?: string;
}

interface Tax {
  id: number;
  taxName: string;
  value: number;
}

function SalesOrderForm() {
  const navigate = useNavigate();
  // State for holding API data and loading status
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      soNumber: "S00001",
      soDate: new Date(),
      customerId: "",
      reference: "",
      lineItems: [{ productName: "", quantity: 1, unitPrice: 0, taxRate: 0 }],
    },
  });

  // Effect to fetch initial data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [customerRes, productRes, taxRes] = await Promise.all([
          axios.get("http://localhost:8000/api/v1/contact-names?type=customer"),
          axios.get("http://localhost:8000/api/v1/products"),
          axios.get("http://localhost:8000/api/v1/taxes"),
        ]);

        if (customerRes.data?.data) setCustomers(customerRes.data.data);
        if (productRes.data?.data) setProducts(productRes.data.data);
        if (taxRes.data?.data) setTaxes(taxRes.data.data);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("Failed to fetch initial data.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

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

  async function onSubmit(values: SalesOrderFormValues) {
    setIsSubmitting(true);

    const apiCall = async () => {
      const payload = {
        contactId: parseInt(values.customerId, 10),
        reference: values.reference,
        soDate: values.soDate,
        soNumber: values.soNumber,
        lines: values.lineItems.map((item) => {
          const product = products.find(
            (p) => p.productName === item.productName
          );
          const tax = taxes.find((t) => Number(t.value) === item.taxRate);

          if (!product) {
            throw new Error(`Product "${item.productName}" not found.`);
          }
          if (!tax) {
            throw new Error(
              `Tax rate of ${item.taxRate}% for "${item.productName}" not found.`
            );
          }

          return {
            productId: product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxId: tax.id,
          };
        }),
      };
      const response = await axios.post(
        "http://localhost:8000/api/v1/sales/orders",
        payload
      );
      return response.data.data;
    };

    toast.promise(apiCall(), {
      loading: "Creating Sales Order...",
      success: (soData) => {
        const selectedCustomer = customers.find(
          (c) => c.id === parseInt(values.customerId)
        );

        const navigationState = {
          salesOrderId: soData.id,
          customerName: selectedCustomer?.contactName,
          invoiceReference: values.reference,
          lineItems: values.lineItems.map((item) => {
            const product = products.find(
              (p) => p.productName === item.productName
            );
            return {
              ...item,
              hsnNo: product?.hsnCode || "",
              accountName: "Sales A/c",
            };
          }),
        };

        navigate("/invoice", { state: { soData: navigationState } });
        return `SO #${soData.soNumber} created. Navigating to create invoice...`;
      },
      error: (err) => {
        return (
          err.response?.data?.error ||
          err.message ||
          "Failed to create Sales Order."
        );
      },
      finally: () => {
        setIsSubmitting(false);
      },
    });
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
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h1 className="text-2xl font-semibold text-gray-800">New Sale Order</h1>
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
                SO No.
              </label>
              <input
                type="text"
                {...form.register("soNumber")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <select
                {...form.register("customerId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                disabled={loadingData}
              >
                <option value="">
                  {loadingData ? "Loading..." : "Select a customer"}
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={String(customer.id)}>
                    {customer.contactName}
                  </option>
                ))}
              </select>
              {form.formState.errors.customerId && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.customerId.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SO Date
              </label>
              <input
                type="date"
                defaultValue={formatDateForInput(form.getValues("soDate"))}
                {...form.register("soDate", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              {form.formState.errors.soDate && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.soDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                {...form.register("reference")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., CUST-REF-001"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 text-sm font-semibold flex items-center"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Submitting..." : "Confirm"}
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

        <div className="border rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  Sr.
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
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
                  Untaxed Amount
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
                const total = untaxedAmount + taxAmount;

                return (
                  <tr key={item.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <select
                        {...form.register(`lineItems.${index}.productName`)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        disabled={loadingData}
                        onChange={(e) => {
                          const name = e.target.value;
                          const product = products.find(
                            (p) => p.productName === name
                          );
                          form.setValue(`lineItems.${index}.productName`, name);
                          if (product) {
                            form.setValue(
                              `lineItems.${index}.unitPrice`,
                              product.salesPrice
                            );
                            form.setValue(
                              `lineItems.${index}.taxRate`,
                              product.salesTax
                            );
                          }
                        }}
                      >
                        <option value="">
                          {loadingData ? "Loading..." : "Select a product"}
                        </option>
                        {products.map((product) => (
                          <option key={product.id} value={product.productName}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
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
                      {untaxedAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {taxAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      {total.toFixed(2)}
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

export default SalesOrderForm;

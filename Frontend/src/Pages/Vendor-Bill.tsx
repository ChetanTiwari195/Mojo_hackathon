import React from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, PlusCircle, XCircle } from "lucide-react";

// --- Zod Schema for Line Items and the Main Form ---
const lineItemSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  hsnNo: z.string().optional(),
  accountName: z.string().min(1, "Account name is required."),
  quantity: z.coerce.number().positive("Qty must be positive."),
  unitPrice: z.coerce.number().positive("Price must be positive."),
  taxRate: z.coerce.number().min(0, "Tax cannot be negative.").max(100),
});

const vendorBillSchema = z.object({
  billNumber: z.string().optional(),
  billDate: z.date({
    message: "A Bill date is required.",
  }),
  dueDate: z.date({
    message: "A Due date is required.",
  }),
  vendorName: z.string().min(2, "Vendor name is required."),
  billReference: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "Please add at least one product."),
});

type VendorBillFormValues = z.infer<typeof vendorBillSchema>;

function VendorBillForm() {
  const form = useForm<VendorBillFormValues>({
    resolver: zodResolver(vendorBillSchema),
    defaultValues: {
      billNumber: "Bill/2025/0001",
      billDate: new Date(),
      dueDate: new Date(),
      vendorName: "Azure Interior",
      billReference: "SUP-25-001",
      lineItems: [
        {
          productName: "",
          hsnNo: "",
          accountName: "",
          quantity: 0,
          unitPrice: 0,
          taxRate: 0,
        },
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

  function onSubmit(values: VendorBillFormValues) {
    console.log("Vendor Bill Submitted:", {
      ...values,
      totals,
    });
    alert(
      "Vendor Bill submitted successfully! Check the console for the form data."
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-10 font-sans p-4">
      {/* --- Top Navigation Buttons --- */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h1 className="text-2xl font-semibold   ">New</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded hover:bg-gray-50">
            Home
          </button>
          <button className="px-4 py-2 border rounded hover:bg-gray-50">
            Back
          </button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Bill Header Section --- */}
        <div className="p-4 border rounded-lg flex justify-between gap-6">
          <div className="flex flex-col gap-6 w-full">
            {/* Vendor Bill No */}
            <div className="col-span-2">
              <label className="block text-sm font-medium    mb-2">
                Vendor Bill No.
              </label>
              <input
                type="text"
                value={form.getValues("billNumber")}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            {/* Vendor Name */}
            <div className="col-span-3">
              <label className="block text-sm font-medium    mb-2">
                Vendor Name
              </label>
              <input
                type="text"
                {...form.register("vendorName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Select a vendor..."
              />

              {form.formState.errors.vendorName && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.vendorName.message}
                </p>
              )}
            </div>

            {/* Bill Reference */}
            <div className="col-span-3">
              <label className="block text-sm font-medium    mb-2">
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

          <div className="w-full flex flex-col gap-6">
            {/* Bill Date */}
            <div className="col-span-2">
              <label className="block text-sm font-medium    mb-2">
                Bill Date
              </label>
              <input
                type="date"
                {...form.register("billDate", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Due Date */}
            <div className="col-span-2">
              <label className="block text-sm font-medium    mb-2">
                Due Date
              </label>
              <input
                type="date"
                {...form.register("dueDate", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* --- Action Bar --- */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Confirm
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Print
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => form.reset()}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Pay
            </button>
          </div>

          {/* Status indicators */}
          <div className="flex gap-6 text-sm text-gray-500">
            <span>Draft</span>
            <ChevronRight size={16} />
            <span>Confirm</span>
            <ChevronRight size={16} />
            <span>Cancelled</span>
          </div>
        </div>

        {/* --- Line Items Table --- */}
        <div className="border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-14 gap-2 p-3 bg-gray-50 font-medium text-sm border-b">
            <div className="col-span-1   ">Sr. No.</div>
            <div className="col-span-2   ">Product</div>
            <div className="col-span-1   ">HSN No.</div>
            <div className="col-span-2   ">Account Name</div>
            <div className="col-span-1   ">Qty</div>
            <div className="col-span-1   ">Unit Price</div>
            <div className="col-span-2   ">Untaxed Amount</div>
            <div className="col-span-1   ">Tax</div>
            <div className="col-span-2   ">Tax Amount</div>
            <div className="col-span-1   ">Total</div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {fields.map((item, index) => {
              const quantity = watchedLineItems[index]?.quantity || 0;
              const unitPrice = watchedLineItems[index]?.unitPrice || 0;
              const taxRate = watchedLineItems[index]?.taxRate || 0;
              const untaxedAmount = quantity * unitPrice;
              const taxAmount = untaxedAmount * (taxRate / 100);
              const totalAmount = untaxedAmount + taxAmount;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-14 gap-2 p-3 items-center"
                >
                  {/* Sr. No. */}
                  <div className="col-span-1 flex items-center gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    <span className="   font-medium">{index + 1}</span>
                  </div>

                  {/* Product */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      {...form.register(`lineItems.${index}.productName`)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Product name"
                    />
                  </div>

                  {/* HSN No */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      {...form.register(`lineItems.${index}.hsnNo`)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="HSN"
                    />
                  </div>

                  {/* Account Name */}
                  <div className="col-span-2">
                    <select
                      {...form.register(`lineItems.${index}.accountName`)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="Purchase Expense A/c">
                        Purchase Expense A/c
                      </option>
                      <option value="Purchase Expenses A/c">
                        Purchase Expenses A/c
                      </option>
                    </select>
                  </div>

                  {/* Qty */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      {...form.register(`lineItems.${index}.quantity`)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      {...form.register(`lineItems.${index}.unitPrice`)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>

                  {/* Untaxed Amount */}
                  <div className="col-span-2">
                    <div>
                      <div className="text-sm font-medium">
                        {untaxedAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-orange-600">
                        ( {quantity} Qty x {unitPrice} )
                      </div>
                    </div>
                  </div>

                  {/* Tax */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        {...form.register(`lineItems.${index}.taxRate`)}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>

                  {/* Tax Amount */}
                  <div className="col-span-2">
                    <div>
                      <div className="text-sm font-medium">
                        {taxAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-blue-600">
                        ( {untaxedAmount} x {taxRate}% )
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-1">
                    <div>
                      <div className="text-sm font-medium">
                        {totalAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-green-600">
                        ( {untaxedAmount} + {taxAmount.toFixed(1)} )
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Line Button */}
          <div className="p-3 border-t bg-gray-50">
            <button
              type="button"
              onClick={() =>
                append({
                  productName: "",
                  hsnNo: "",
                  accountName: "Purchase Expense A/c",
                  quantity: 0,
                  unitPrice: 0,
                  taxRate: 0,
                })
              }
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add a line
            </button>
          </div>

          {/* Totals and Payment Section */}
          <div className="grid grid-cols-14 gap-2 p-3 bg-gray-100 border-t-2">
            {/* Total Row */}
            <div className="col-span-6"></div>
            <div className="col-span-2    font-medium">Total</div>
            <div className="col-span-2 text-right font-medium">
              {totals.untaxed.toFixed(2)}
            </div>
            <div className="col-span-2 text-right font-medium">
              {totals.tax.toFixed(1)}
            </div>
            <div className="col-span-2 text-right">
              <div className="border-2 border-gray-400 rounded px-2 py-1 bg-white font-bold">
                {totals.total.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-3 bg-gray-50 border-t">
            <div className="flex justify-end space-y-2">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Via Cash</span>
                  <span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Via Bank</span>
                  <span className="font-medium">{totals.total.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="   font-medium">Amount Due</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>(Total - Payment)</span>
                  <span></span>
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

export default VendorBillForm;

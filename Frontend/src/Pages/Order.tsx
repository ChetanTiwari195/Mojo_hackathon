import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, PlusCircle, XCircle } from "lucide-react";
import React from "react";
// import { format } from "date-fns";

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
  vendorName: z.string().min(2, "Vendor name is required."),
  reference: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "Please add at least one product."),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

function PurchaseOrderForm() {
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      poNumber: "P00001",
      poDate: new Date(),
      vendorName: "",
      reference: "",
      lineItems: [
        { productName: "", quantity: 0, unitPrice: 0, taxRate: 0 },
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

  return (
    <div className="max-w-7xl mx-auto my-10 font-sans p-4">
      {/* --- Top Navigation Buttons --- */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h1 className="text-2xl font-semibold  ">New</h1>
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
        {/* --- PO Header Section --- */}
        <div className="p-4 border rounded-lg flex justify-between gap-6">
          <div className="w-full flex flex-col gap-6">
            {/* PO Number */}
            <div>
              <label className="block text-sm font-medium   mb-2">PO No.</label>
              <input
                type="text"
                value={form.getValues("poNumber")}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            {/* Vendor Name */}
            <div>
              <label className="block text-sm font-medium   mb-2">
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

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium   mb-2">
                Reference
              </label>
              <input
                type="text"
                {...form.register("reference")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., REQ-25-0001"
              />
            </div>
          </div>

          {/* PO Date */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">PO Date</label>
            <input
              type="date"
              {...form.register("poDate", {
                setValueAs: (value) => (value ? new Date(value) : undefined),
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* --- Action Bar --- */}
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
              Create Bill
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
          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 font-medium text-sm border-b">
            <div className="col-span-1  ">Sr. No.</div>
            <div className="col-span-2  ">Product</div>
            <div className="col-span-1  ">Qty</div>
            <div className="col-span-1  ">Unit Price</div>
            <div className="col-span-2  ">Untaxed Amount</div>
            <div className="col-span-2  ">Tax</div>
            <div className="col-span-2  ">Tax Amount</div>
            <div className="col-span-1  ">Total</div>
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
                  className="grid grid-cols-12 gap-2 p-3 items-center"
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
                    <span className="  font-medium">{index + 1}</span>
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
                        ( {quantity} x {unitPrice} )
                      </div>
                    </div>
                  </div>

                  {/* Tax */}
                  <div className="col-span-2">
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

          {/* Totals Row */}
          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-100 border-t-2 font-medium">
            <div className="col-span-4"></div>
            <div className="col-span-2  ">Total</div>
            <div className="col-span-2 text-right">
              {totals.untaxed.toFixed(2)}
            </div>
            <div className="col-span-2 text-right">{totals.tax.toFixed(2)}</div>
            <div className="col-span-2 text-right">
              <div className="border-2 border-gray-400 rounded px-2 py-1 bg-white">
                {totals.total.toFixed(2)}
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

export default PurchaseOrderForm;

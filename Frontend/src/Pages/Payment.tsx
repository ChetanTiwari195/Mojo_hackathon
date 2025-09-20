import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";

// --- Zod Schema for Payment Form ---
const paymentSchema = z.object({
  paymentNumber: z.string().optional(),
  paymentType: z.enum(["send", "receive"]),
  date: z.date({
    message: "A date is required.",
  }),
  partnerType: z.enum(["customer", "vendor"]),
  paymentVia: z.string().min(1, "Payment method is required."),
  partner: z.string().min(2, "Partner is required."),
  note: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive."),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

function PaymentForm() {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentNumber: "",
      paymentType: undefined,
      date: new Date(),
      partnerType: undefined,
      paymentVia: "",
      partner: "",
      note: "",
      amount: 0,
    },
  });

  const watchedPaymentType = form.watch("paymentType");
  const watchedPartnerType = form.watch("partnerType");

  function onSubmit(values: PaymentFormValues) {
    console.log("Payment Submitted:", values);
    alert(
      "Payment submitted successfully! Check the console for the form data."
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-10 font-sans p-4">
      {/* --- Top Navigation Buttons --- */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold    ">New</h1>
          <span className="text-lg text-gray-700">
            {form.getValues("paymentNumber")}
          </span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Action Bar --- */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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

        {/* --- Payment Details Form --- */}
        <div className="p-6 border rounded-lg space-y-6">
          {/* First Row - Payment Type and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium     mb-3">
                Payment Type
              </label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="send"
                    {...form.register("paymentType")}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-blue-600">Send</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="receive"
                    {...form.register("paymentType")}
                    className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                  />
                  <span className="ml-2 text-gray-600">Receive</span>
                </label>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium     mb-2">Date</label>
              <input
                type="date"
                {...form.register("date", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />

              {form.formState.errors.date && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
          </div>

          {/* Second Row - Partner Type and Payment Via */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Partner Type */}
            <div>
              <label className="block text-sm font-medium     mb-3">
                Partner Type
              </label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="customer"
                    {...form.register("partnerType")}
                    className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                  />
                  <span className="ml-2 text-gray-600">Customer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="vendor"
                    {...form.register("partnerType")}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-blue-600">Vendor</span>
                </label>
              </div>
            </div>

            {/* Payment Via */}
            <div>
              <label className="block text-sm font-medium     mb-2">
                Payment Via
              </label>
              <select
                {...form.register("paymentVia")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Bank">Bank</option>
                <option value="Cash" selected>
                  Cash
                </option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
              </select>
              {form.formState.errors.paymentVia && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.paymentVia.message}
                </p>
              )}
            </div>
          </div>

          {/* Third Row - Partner and Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Partner */}
            <div>
              <label className="block text-sm font-medium     mb-2">
                Partner
              </label>
              <input
                type="text"
                {...form.register("partner")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Select partner..."
              />

              {form.formState.errors.partner && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.partner.message}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium     mb-2">Note</label>
              <input
                type="text"
                {...form.register("note")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add a note..."
              />
            </div>
          </div>

          {/* Fourth Row - Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium     mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                {...form.register("amount")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-lg font-semibold"
              />

              {form.formState.errors.amount && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
            <div></div>
          </div>
        </div>

        {/* Summary Display */}
        <div className="p-4 bg-gray-50 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Payment Type:</span>
              <span className="ml-2 font-medium capitalize text-blue-600">
                {watchedPaymentType}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Partner Type:</span>
              <span className="ml-2 font-medium capitalize text-blue-600">
                {watchedPartnerType}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Partner:</span>
              <span className="ml-2 font-medium">
                {form.watch("partner") || "Not selected"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-bold text-lg">
                ₹{form.watch("amount")?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PaymentForm;

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// --- Zod Validation Schema ---
// MODIFIED: Added 'both' to align with the backend model
const taxFormSchema = z.object({
  taxName: z.string().min(3, "Tax name must be at least 3 characters."),
  taxComputation: z.enum(["percentage", "fixed"], {
  invalid_type_error: "You must select a computation type.", // This is correct
}),
  taxFor: z.enum(["purchase", "sales", "both"], {
    // Added "both"
    required_error: "You must select the tax scope.",
  }),
  value: z.coerce.number().positive("Value must be a positive number."), // Use coerce for better input handling
});

type TaxFormValues = z.infer<typeof taxFormSchema>;

// --- The Tax Form Component ---
function TaxForm() {
  // NEW: State to manage loading during form submission
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      taxName: "",
      taxComputation: "percentage",
      taxFor: "sales", // Default to 'sales'
      value: undefined, // Start with no value
    },
  });

  const taxComputationType = form.watch("taxComputation");

  // MODIFIED: onSubmit function now handles the API call
  async function onSubmit(values: TaxFormValues) {
    setIsLoading(true);

    // 1. Map frontend field names to backend model names
    const payload = {
      taxName: values.taxName,
      computationMethod: values.taxComputation, // Map to backend name
      taxScope: values.taxFor, // Map to backend name
      value: values.value,
    };

    try {
      // 2. Make the POST request with axios
      const response = await axios.post(
        "http://localhost:8000/api/v1/taxes", // Adjust URL if needed
        payload
      );

      toast.success(response.data.message || "Tax created successfully!");
      form.reset(); // Clear the form on success
    } catch (error) {
      console.error("Failed to create tax:", error);
      // 3. Provide type-safe error handling
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || "An unknown server error occurred.";
        toast.error(`Failed to create tax: ${errorMessage}`);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false); // Re-enable the form
    }
  }

  return (
    <div className="max-w-2xl mx-auto my-10 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button variant="outline">New</Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Confirm</Button>
          <Button variant="outline">Archived</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Home</Button>
          <Button variant="outline">Back</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
          <CardDescription>
            Create and manage tax rates for sales and purchases.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          {/* The form now calls the new async onSubmit function */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-6">
              {/* --- Tax Name --- */}
              <FormField
                control={form.control}
                name="taxName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5% GST" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Tax Computation --- */}
              <FormField
                control={form.control}
                name="taxComputation"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tax Computation</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="percentage" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            % (Percentage)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="fixed" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Fixed Value
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Tax Scope (was Tax For) --- */}
              {/* MODIFIED: Added a third option for "Both" */}
              <FormField
                control={form.control}
                name="taxFor"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tax Scope</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="sales" />
                          </FormControl>
                          <FormLabel className="font-normal">Sales</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="purchase" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Purchase
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="both" />
                          </FormControl>
                          <FormLabel className="font-normal">Both</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Value --- */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          taxComputationType === "percentage"
                            ? "e.g., 5 for 5%"
                            : "e.g., 50.00 for a fixed amount"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="mt-6">
              {/* MODIFIED: Button now shows loading state */}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Tax"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default TaxForm;

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

// --- Zod Validation Schema for the Tax Form ---
const taxFormSchema = z.object({
  taxName: z.string().min(3, "Tax name must be at least 3 characters."),
  taxComputation: z.enum(["percentage", "fixed"], {
    errorMap: () => ({ message: "You must select a computation type." }),
  }),
  taxFor: z.enum(["purchase", "sales"], {
    errorMap: () => ({
      message: "You must select if this tax applies to purchases or sales.",
    }),
  }),
  value: z.number().positive("Value must be a positive number."),
});

// Infer the TypeScript type from the schema
type TaxFormValues = z.infer<typeof taxFormSchema>;

// --- The Tax Form Component ---
function TaxForm() {
  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      taxName: "",
      taxComputation: "percentage",
      taxFor: "purchase",
      value: 0,
    },
  });

  // Watch the value of 'taxComputation' to dynamically update the UI
  const taxComputationType = form.watch("taxComputation");

  function onSubmit(values: TaxFormValues) {
    console.log("Tax Form Submitted:", values);
    alert("Tax configuration saved! Check the console for the form data.");
  }

  return (
    <div className="max-w-2xl mx-auto my-10 font-sans">
      {/* --- Top Navigation Buttons --- */}
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

              {/* --- Tax For --- */}
              <FormField
                control={form.control}
                name="taxFor"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tax For</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                      >
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
                            <RadioGroupItem value="sales" />
                          </FormControl>
                          <FormLabel className="font-normal">Sales</FormLabel>
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
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="mt-6">
              <Button type="submit">Save Tax</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default TaxForm;

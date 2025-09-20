import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // NEW: Import hooks
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

// Zod schema remains the same
const taxFormSchema = z.object({
  taxName: z.string().min(3, "Tax name must be at least 3 characters."),
  computationMethod: z.enum(["percentage", "fixed"], {
    invalid_type_error: "You must select a computation type.",
  }),
  taxScope: z.enum(["purchase", "sales", "both"], {
    required_error: "You must select the tax scope.",
  }),
  value: z.coerce.number().positive("Value must be a positive number."),
});

type TaxFormValues = z.infer<typeof taxFormSchema>;

function TaxForm() {
  const { id: taxId } = useParams(); // NEW: Get ID from URL
  const navigate = useNavigate(); // NEW: Hook for navigation
  const isEditMode = Boolean(taxId);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      taxName: "",
      computationMethod: "percentage",
      taxScope: "sales",
      value: undefined,
    },
  });

  // NEW: useEffect to fetch data in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchTaxData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8000/api/v1/taxes/${taxId}`
          );
          const taxData = response.data.data;
          form.reset(taxData); // Populate form with fetched data
        } catch (error) {
          toast.error("Failed to fetch tax details.");
          console.error(error);
          navigate("/master-data"); // Redirect if tax not found
        } finally {
          setIsLoading(false);
        }
      };
      fetchTaxData();
    }
  }, [isEditMode, taxId, form, navigate]);

  const computationMethod = form.watch("computationMethod");

  // MODIFIED: onSubmit now handles both create and update
  async function onSubmit(values: TaxFormValues) {
    setIsLoading(true);

    try {
      if (isEditMode) {
        // --- UPDATE LOGIC ---
        const response = await axios.put(
          `http://localhost:8000/api/v1/taxes/${taxId}`,
          values
        );
        toast.success(response.data.message || "Tax updated successfully!");
      } else {
        // --- CREATE LOGIC ---
        const response = await axios.post(
          "http://localhost:8000/api/v1/taxes",
          values
        );
        toast.success(response.data.message || "Tax created successfully!");
      }
      navigate("/master-data"); // Navigate to the list page on success
    } catch (error) {
      console.error("Failed to save tax:", error);
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || "An unknown server error occurred.";
        toast.error(`Failed: ${errorMessage}`);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto my-10">
      <Card>
        <CardHeader>
          {/* DYNAMIC UI */}
          <CardTitle>{isEditMode ? "Edit Tax" : "Create New Tax"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update the details for this tax."
              : "Configure a new tax rate for sales and purchases."}
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
                name="computationMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tax Computation</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
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

              {/* --- Tax Scope --- */}
              <FormField
                control={form.control}
                name="taxScope"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tax Scope</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
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
                          computationMethod === "percentage"
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

            <CardFooter className="flex justify-end border-t pt-6 mt-6">
              {/* DYNAMIC UI */}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Create Tax"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default TaxForm;

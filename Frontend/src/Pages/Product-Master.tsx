import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";

// --- Zod Validation Schema ---
const productFormSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters."),
  productType: z.enum(["goods", "service"], {
    errorMap: () => ({ message: "You need to select a product type." }),
  }),
  category: z.string().min(2, "Category is too short."),
  hsnSacCode: z.number().min(1000, "Please enter a valid HSN/SAC code."),
  salesPrice: z.number().positive("Sales price must be positive."),
  salesTax: z
    .number()
    .min(0, "Tax cannot be negative.")
    .max(100, "Tax cannot exceed 100."),
  purchasePrice: z.number().positive("Purchase price must be positive."),
  purchaseTax: z
    .number()
    .min(0, "Tax cannot be negative.")
    .max(100, "Tax cannot exceed 100."),
});

// Define the form values type from the schema
type ProductFormValues = z.infer<typeof productFormSchema>;

// --- API Fetching and Types ---
interface HsnSuggestion {
  c: string; // HSN Code
  n: string; // Description
}

async function fetchHsnSuggestions(
  query: string,
  productType: "goods" | "service"
): Promise<HsnSuggestion[]> {
  if (query.length < 2) return [];

  const category = productType === "goods" ? "P" : "S";
  const searchType = /^\d+$/.test(query) ? "byCode" : "byDesc";
  const endpoint = `https://services.gst.gov.in/commonservices/hsn/search/qsearch?inputText=${query}&selectedType=${searchType}&category=${category}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch HSN/SAC suggestions:", error);
    return [];
  }
}

// --- The Product Form Component ---
function ProductForm() {
  const [hsnQuery, setHsnQuery] = React.useState("");
  const [hsnSuggestions, setHsnSuggestions] = React.useState<HsnSuggestion[]>(
    []
  );
  const [isHsnLoading, setIsHsnLoading] = React.useState(false);
  const [isHsnListOpen, setIsHsnListOpen] = React.useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: "",
      productType: "goods",
      category: "",
      hsnSacCode: 0,
      salesPrice: 0,
      salesTax: 0,
      purchasePrice: 0,
      purchaseTax: 0,
    },
  });

  const productType = form.watch("productType");

  React.useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (hsnQuery) {
        setIsHsnLoading(true);
        fetchHsnSuggestions(hsnQuery, productType)
          .then((suggestions) => {
            setHsnSuggestions(suggestions);
          })
          .finally(() => setIsHsnLoading(false));
      } else {
        setHsnSuggestions([]);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [hsnQuery, productType]);

  function onSubmit(values: ProductFormValues) {
    console.log("Form Submitted:", values);
    alert("Product created successfully! Check the console for data.");
  }

  return (
    <div className="max-w-4xl mx-auto my-10 font-sans">
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column */}
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Table Tennis Bat"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Product Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="goods" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Goods
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="service" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Service
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Sports Equipment"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hsnSacCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HSN/SAC Code</FormLabel>
                        <FormControl>
                          <Command
                            shouldFilter={false}
                            className="overflow-visible"
                          >
                            <CommandInput
                              placeholder="Search by code or description..."
                              value={hsnQuery}
                              onValueChange={setHsnQuery}
                              onFocus={() => setIsHsnListOpen(true)}
                              onBlur={() =>
                                setTimeout(() => setIsHsnListOpen(false), 150)
                              }
                            />
                            <div className="relative">
                              {isHsnListOpen && hsnQuery.length > 1 && (
                                <CommandList className="absolute top-1 w-full z-10 bg-background border rounded-md shadow-md">
                                  {isHsnLoading ? (
                                    <div className="p-2 text-sm text-center">
                                      Fetching...
                                    </div>
                                  ) : hsnSuggestions.length > 0 ? (
                                    hsnSuggestions.map((suggestion) => (
                                      <CommandItem
                                        key={suggestion.c}
                                        value={`${suggestion.c} - ${suggestion.n}`}
                                        onSelect={() => {
                                          form.setValue(
                                            "hsnSacCode",
                                            parseInt(suggestion.c, 10)
                                          );
                                          setHsnQuery(
                                            `${suggestion.c} - ${suggestion.n}`
                                          );
                                          setIsHsnListOpen(false);
                                          setHsnSuggestions([]);
                                        }}
                                      >
                                        <span className="font-medium mr-2">
                                          {suggestion.c}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {suggestion.n}
                                        </span>
                                      </CommandItem>
                                    ))
                                  ) : (
                                    <CommandEmpty>
                                      No results found.
                                    </CommandEmpty>
                                  )}
                                </CommandList>
                              )}
                            </div>
                          </Command>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column */}
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="salesPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales Price (Rs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="22.20"
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
                  <FormField
                    control={form.control}
                    name="salesTax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales Tax (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5"
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
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price (Rs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="15.00"
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
                  <FormField
                    control={form.control}
                    name="purchaseTax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Tax (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5"
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
                </div>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default ProductForm;

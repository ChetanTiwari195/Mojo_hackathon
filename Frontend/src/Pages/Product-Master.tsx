import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Zod Validation Schema ---
const productFormSchema = z.object({
  productName: z.string().min(2, "Product name is required."),
  productType: z.enum(["goods", "service"]),
  categoryId: z.string().min(1, "Category is required."),
  hsnCode: z.string().optional(),
  salesPrice: z.coerce.number().positive("Sales price must be positive."),
  salesTax: z.coerce.number().min(0, "Sales tax is required."),
  purchasePrice: z.coerce.number().positive("Purchase price must be positive."),
  purchaseTax: z.coerce.number().min(0, "Purchase tax is required."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// --- API Types ---
interface Product {
  id: number;
  productName: string;
  productType: "goods" | "service";
  categoryId: number;
  hsnCode: string;
  salesPrice: number;
  purchasePrice: number;
  salesTax: number;
  purchaseTax: number;
}

interface Category {
  id: number;
  name: string;
}

interface Tax {
  id: number;
  taxName: string;
  value: number;
}

// --- HSN Code Fetching Utility ---
const fetchHsnCode = async (
  productName: string,
  productType: "goods" | "service"
) => {
  if (!productName || productName.trim().length < 3) {
    return null;
  }
  const query = productName.split(" ")[0];
  // Set category to 'P' for goods or 'S' for services
  const category = productType === "goods" ? "P" : "S";

  try {
    // NOTE: This is a direct API call that might be blocked by CORS in a browser environment.
    // A backend proxy is recommended for production use.
    const response = await fetch(
      `https://services.gst.gov.in/commonservices/hsn/search/qsearch?inputText=${query}&selectedType=byDesc&category=${category}`
    );
    if (!response.ok) {
      console.error("Failed to fetch HSN data. Status:", response.status);
      return null;
    }
    const data = await response.json();
    // The API response uses 'c' for the code
    return data?.data?.[0]?.c || null;
  } catch (error) {
    console.error("Error fetching HSN code:", error);
    return null;
  }
};

// --- The Product Form Component ---
function ProductForm() {
  const { id } = useParams(); // Get product ID from URL params
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: "",
      productType: "goods",
      categoryId: "",
      hsnCode: "",
      salesPrice: 0,
      salesTax: 0,
      purchasePrice: 0,
      purchaseTax: 0,
    },
  });

  const productNameValue = form.watch("productName");
  const productTypeValue = form.watch("productType");

  // Fetch initial data for categories, taxes, and existing product (if editing)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodResponse, catResponse, taxResponse] = await Promise.all([
          axios.get("http://localhost:8000/api/v1/products"),
          axios.get("http://localhost:8000/api/v1/categories"),
          axios.get("http://localhost:8000/api/v1/taxes"),
        ]);

        setProducts(prodResponse.data.data);
        setCategories(catResponse.data.data);
        setTaxes(taxResponse.data.data);

        // If editing, fetch the specific product data
        if (isEditing && id) {
          const productResponse = await axios.get(
            `http://localhost:8000/api/v1/products/${id}`
          );
          const productData = productResponse.data.data;

          // Populate form with existing product data
          form.setValue("productName", productData.productName);
          form.setValue("productType", productData.productType);
          form.setValue("categoryId", String(productData.categoryId));
          form.setValue("hsnCode", productData.hsnCode || "");
          form.setValue("salesPrice", productData.salesPrice);
          form.setValue("salesTax", productData.salesTax);
          form.setValue("purchasePrice", productData.purchasePrice);
          form.setValue("purchaseTax", productData.purchaseTax);
        }
      } catch (error) {
        toast.error(
          isEditing
            ? "Failed to fetch product data."
            : "Failed to fetch initial data."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing, form]);

  // Debounced effect to fetch HSN code (only for new products)
  useEffect(() => {
    if (isEditing || productNameValue.length < 3) {
      return;
    }

    const isExistingProduct = products.some(
      (p) => p.productName.toLowerCase() === productNameValue.toLowerCase()
    );
    if (isExistingProduct) {
      return; // Don't fetch if it's an existing product, as that's handled onChange
    }

    const handler = setTimeout(async () => {
      const hsnCode = await fetchHsnCode(productNameValue, productTypeValue);
      if (hsnCode) {
        form.setValue("hsnCode", hsnCode, { shouldValidate: true });
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [productNameValue, productTypeValue, form, products, isEditing]);

  function onSubmit(values: ProductFormValues) {
    // Convert categoryId to number for API submission
    const payload = {
      ...values,
      categoryId: parseInt(values.categoryId, 10),
    };

    const apiCall = isEditing
      ? axios.put(`http://localhost:8000/api/v1/products/${id}`, payload)
      : axios.post("http://localhost:8000/api/v1/products", payload);

    toast.promise(apiCall, {
      loading: isEditing ? "Updating product..." : "Creating product...",
      success: (res) => {
        if (!isEditing) {
          form.reset();
          // Optionally update local products list
          if (res.data && res.data.data) {
            setProducts((prev) => [...prev, res.data.data]);
          }
        }
        return `Product "${res.data.data.productName}" ${
          isEditing ? "updated" : "created"
        } successfully!`;
      },
      error: `Failed to ${isEditing ? "update" : "create"} product.`,
    });
  }

  const handleBack = () => {
    navigate("/master-data");
  };

  const handleNew = () => {
    if (isEditing) {
      navigate("/product-master/create");
    } else {
      form.reset();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading product data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-10 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={handleNew}>
            New
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            {isEditing ? "Update" : "Confirm"}
          </Button>
          <Button variant="outline" type="button">
            Archived
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button variant="outline" type="button" onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            placeholder="Enter product name"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);

                              // Only auto-populate for new products
                              if (!isEditing) {
                                const matchedProduct = products.find(
                                  (p) =>
                                    p.productName.toLowerCase() ===
                                    value.toLowerCase()
                                );

                                if (matchedProduct) {
                                  form.setValue(
                                    "productName",
                                    matchedProduct.productName
                                  );
                                  form.setValue(
                                    "productType",
                                    matchedProduct.productType
                                  );
                                  form.setValue(
                                    "categoryId",
                                    String(matchedProduct.categoryId)
                                  );
                                  form.setValue(
                                    "hsnCode",
                                    matchedProduct.hsnCode
                                  );
                                  form.setValue(
                                    "salesPrice",
                                    matchedProduct.salesPrice
                                  );
                                  form.setValue(
                                    "purchasePrice",
                                    matchedProduct.purchasePrice
                                  );
                                  form.setValue(
                                    "salesTax",
                                    matchedProduct.salesTax
                                  );
                                  form.setValue(
                                    "purchaseTax",
                                    matchedProduct.purchaseTax
                                  );
                                }
                              }
                            }}
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
                            value={field.value}
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
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hsnCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HSN/SAC Code</FormLabel>
                        <FormControl>
                          <Input
                            readOnly
                            placeholder="Auto-filled"
                            {...field}
                          />
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
                          <Input type="number" {...field} />
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
                        <Select
                          onValueChange={(value) => {
                            const numericValue = Number(value);
                            form.setValue("salesTax", numericValue, {
                              shouldValidate: true,
                            });
                            form.setValue("purchaseTax", numericValue, {
                              shouldValidate: true,
                            });
                          }}
                          value={field.value > 0 ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a tax" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {taxes.map((tax) => (
                              <SelectItem
                                key={tax.id}
                                value={String(tax.value)}
                              >
                                {tax.taxName} - {tax.value}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          <Input type="number" {...field} />
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
                        <Select
                          onValueChange={(value) => {
                            const numericValue = Number(value);
                            form.setValue("purchaseTax", numericValue, {
                              shouldValidate: true,
                            });
                            form.setValue("salesTax", numericValue, {
                              shouldValidate: true,
                            });
                          }}
                          value={field.value > 0 ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a tax" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {taxes.map((tax) => (
                              <SelectItem
                                key={tax.id}
                                value={String(tax.value)}
                              >
                                {tax.taxName} - {tax.value}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

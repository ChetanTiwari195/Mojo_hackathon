import React from "react";
import { Upload, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { isAxiosError } from "axios"; // MODIFIED: Import isAxiosError for better type safety

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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// MODIFIED: Added the 'type' field to the validation schema
const contactFormSchema = z.object({
  contactName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Please enter a valid email."),
  phone: z.string().refine((val) => /^\d{10}$/.test(val), {
    message: "Please enter a valid 10-digit phone number.",
  }),
  // FIX #1: Add the 'type' field to the schema to match the form
  type: z.enum(["customer", "vendor", "both"], {
    required_error: "Please select a contact type.",
  }),
  address: z.string().min(5, "Address is too short."),
  city: z.string().min(2, "City name is too short."),
  state: z.string().min(2, "State name is too short."),
  pincode: z.string().refine((val) => /^\d{6}$/.test(val), {
    message: "Please enter a valid 6-digit pincode.",
  }),
});

// NEW: Create a type alias from the schema for stronger type safety
type ContactFormValues = z.infer<typeof contactFormSchema>;

function ContactForm() {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // MODIFIED: Use the new type alias and corrected default values
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      contactName: "",
      email: "",
      phone: "",
      // FIX #2: Remove 'type' from here; its default is handled by the form state
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  // MODIFIED: Use the new type alias for the 'values' parameter
  async function onSubmit(values: ContactFormValues) {
    setIsLoading(true);
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/contacts",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Success:", response.data);
      toast.success("Contact has been created successfully.");
      form.reset();
      setImagePreview(null);
      setImageFile(null);
    } catch (error) {
      console.error("Failed to create contact:", error);
      // MODIFIED: Use isAxiosError for type-safe error handling
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || "An unknown server error occurred.";
        toast.error(`Failed to create contact: ${errorMessage}`);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="max-w-4xl mx-auto my-10">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Contact Information
        </CardTitle>
        <CardDescription>
          Fill out the form to add a new contact.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 grid gap-6">
                {/* ... other fields like contactName, email ... */}
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* FIX #3: Correctly implemented the Select component */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel> {/* Corrected label */}
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Bengaluru" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Karnataka" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="560001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ... Image Upload Section ... */}
              <div className="md:col-span-1 flex flex-col items-center justify-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                <div
                  className="w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={handleUploadClick}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Contact"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="mx-auto h-10 w-10 mb-2" />
                      <span>Upload Image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-start border-t pt-6 mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Submitting..." : "Confirm"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default ContactForm;

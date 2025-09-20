import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // NEW: Import hooks for routing
import { Upload, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { isAxiosError } from "axios";

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

// Schema remains the same
const contactFormSchema = z.object({
  contactName: z.string().min(2, "Name must be at least 2 characters."),
  email: z
    .string()
    .email("Please enter a valid email.")
    .optional()
    .or(z.literal("")),
  phone: z.string().refine((val) => /^\d{10}$/.test(val), {
    message: "Please enter a valid 10-digit phone number.",
  }),
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

type ContactFormValues = z.infer<typeof contactFormSchema>;

// MODIFIED: The component now handles both create and edit
function ContactForm() {
  const { id: contactId } = useParams(); // NEW: Get the ID from the URL
  const navigate = useNavigate(); // NEW: Hook for navigation
  const isEditMode = Boolean(contactId); // NEW: Determine if we are in "edit" mode

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  // NEW: useEffect to fetch data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchContactData = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(
            `http://localhost:8000/api/v1/contacts/${contactId}`
          );
          const contact = response.data.data; // Adjust based on your API response structure
          form.reset(contact); // Populate the form with fetched data
          if (contact.image) {
            setImagePreview(contact.image); // Set the existing image for preview
          }
        } catch (error) {
          toast.error("Failed to fetch contact details.");
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchContactData();
    }
  }, [contactId, form.reset, isEditMode]);

  async function onSubmit(values: ContactFormValues) {
    setIsLoading(true);
    const formData = new FormData();

    // Append form values to FormData
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        // Ensure null or undefined values aren't sent
        formData.append(key, value);
      }
    });

    // Append the new image file only if it has been changed
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      let response;
      // MODIFIED: Conditional API call
      if (isEditMode) {
        // UPDATE Request
        response = await axios.put(
          `http://localhost:8000/api/v1/contacts/${contactId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Contact has been updated successfully.");
      } else {
        // CREATE Request
        response = await axios.post(
          "http://localhost:8000/api/v1/contacts",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Contact has been created successfully.");
      }

      console.log("Success:", response.data);
      navigate("/master-data"); // NEW: Navigate back to the list on success
    } catch (error) {
      console.error("Submission failed:", error);
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

  // ... (handleImageChange and handleUploadClick remain the same)
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
        {/* MODIFIED: Dynamic title and description */}
        <CardTitle className="text-2xl font-semibold">
          {isEditMode ? "Edit Contact" : "Create New Contact"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update the contact's information below."
            : "Fill out the form to add a new contact."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            {/* ... Form fields are the same, they will be populated by react-hook-form ... */}
            {/* The rest of your JSX for the form fields goes here unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 grid gap-6">
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
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value} // Use value for controlled component
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
            {/* MODIFIED: Dynamic button text */}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Confirm"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default ContactForm;

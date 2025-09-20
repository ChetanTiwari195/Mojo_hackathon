import React from "react";
import { Upload } from "lucide-react";
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

// Validation Schema for the Contact Form
const contactFormSchema = z.object({
  contactName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Please enter a valid email."),
  phone: z.coerce
    .number()
    .min(1000000000, "Please enter a valid 10-digit phone number."),
  address: z.string().min(5, "Address is too short."),
  city: z.string().min(2, "City name is too short."),
  state: z.string().min(2, "State name is too short."),
  postcode: z.coerce
    .number()
    .min(100000, "Please enter a valid 6-digit postcode."),
  // We'll handle the image separately, so it's not in the Zod schema for form data
});

// The New Contact Form Component
function ContactForm() {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      contactName: "",
      email: "",
      phone: undefined,
      address: "",
      city: "",
      state: "",
      postcode: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    // Handle form submission logic
    console.log({
      formData: values,
      // In a real app, you would handle the file upload here.
      // For example, using FormData to send to an API.
    });
    alert("Contact created successfully! Check the console for the form data.");
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="max-w-4xl mx-auto my-10">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Contact Information</CardTitle>
        <CardDescription>
          Fill out the form to add a new contact.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Form Fields */}
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
                        <Input placeholder="user@example.com" {...field} />
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
                        <Input
                          type="number"
                          placeholder="9876543210"
                          {...field}
                        />
                      </FormControl>
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
                          <Input placeholder="Anytown" {...field} />
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
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="123456"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column: Image Upload */}
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
            <Button type="submit">Confirm</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default ContactForm;
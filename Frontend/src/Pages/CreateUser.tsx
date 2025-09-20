import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ✅ 1. Schema updated to match backend model and corrected Zod enum syntax
const userFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    email: z.string().email("Please enter a valid email address."),
    // Values capitalized to match backend ENUM ('Admin', 'Invoicing', 'Contact')
    role: z.enum(["Admin", "Invoicing", "Contact"]),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    password2: z.string(),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match.",
    path: ["password2"],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

// Define types for API responses for type safety
type ApiResponse = {
  message: string;
};

type ApiErrorResponse = {
  message: string;
};

function CreateUserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    // Default role set to a valid enum value
    defaultValues: {
      name: "",
      email: "",
      role: "Contact",
      password: "",
      password2: "",
    },
  });

  // ✅ 2. onSubmit function now handles the API call, loading state, and toasts
  async function onSubmit(values: UserFormValues) {
    setIsLoading(true);

    const apiCall = axios.post<ApiResponse>(
      // NOTE: Replace with your actual API base URL
      "http://localhost:8000/api/v1/register",
      values
    );

    toast.promise(apiCall, {
      loading: "Creating user...",
      success: (response) => {
        form.reset();
        // navigate("/users");
        return response.data.message;
      },
      error: (error: AxiosError<ApiErrorResponse>) => {
        return error.response?.data?.message || "Failed to create user.";
      },
      finally: () => {
        setIsLoading(false);
      },
    });
  }

  return (
    <div className="max-w-4xl mx-auto my-10 font-sans p-4">
      {/* ✅ 3. Navigation buttons are now functional */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
          <CardDescription>
            Fill in the details below to create a new user account.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Jane Doe"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Invoicing">Invoicing</SelectItem>
                          <SelectItem value="Contact">Contact</SelectItem>
                        </SelectContent>
                      </Select>
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
                          placeholder="e.g., jane.doe@example.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div /> {/* Empty div for grid alignment */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Re-Enter Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-start gap-2 border-t pt-6 mt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default CreateUserForm;

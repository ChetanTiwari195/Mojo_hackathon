import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Zod Validation Schema for the Account Form ---
const accountFormSchema = z.object({
  accountName: z.string().min(3, "Account name must be at least 3 characters."),
  accountType: z.enum(["assets", "liabilities", "income", "expense"], {
    required_error: "Please select an account type.",
  }),
});

// Infer the TypeScript type from the Zod schema
type AccountFormValues = z.infer<typeof accountFormSchema>;

// --- The Account Form Component ---
function AccountForm() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      accountName: "",
      accountType: undefined,
    },
  });

  function onSubmit(values: AccountFormValues) {
    console.log("Account Form Submitted:", values);
    alert("Account created successfully! Check the console for the form data.");
  }

  return (
    <div className="max-w-4xl mx-auto my-10 font-sans">
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
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Add a new account to your chart of accounts.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- Account Name --- */}
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bank A/c" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- Account Type --- */}
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="assets">Assets</SelectItem>
                          <SelectItem value="liabilities">
                            Liabilities
                          </SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-start border-t pt-6 mt-6">
              <Button type="submit">Save Account</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default AccountForm;

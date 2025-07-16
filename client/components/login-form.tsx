"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiBugLine } from "@remixicon/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputPassword from "./input-password";

// The Zod schema is now the single source of truth for validation
export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-background z-10 text-secondary-foreground">
      <div className="flex flex-col items-start mb-8">
        <div className="text-emerald-600 mb-4">
          <RiBugLine className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-medium mb-2 tracking-tight">Login</h2>
        <p className="text-left text-muted-foreground">
          Log in to access your dashboard.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@domain.com"
                    {...field}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <InputPassword
                    disabled={isLoading}
                    {...field}
                    value={field.value || ""}
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-muted-foreground text-sm mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-secondary-foreground font-medium underline hover:no-underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

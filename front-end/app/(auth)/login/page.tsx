"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { useForm } from "react-hook-form";
import {
  LoginFormFields,
  LoginFormSchema,
  loginFormSchema,
} from "./validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/form-input";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();

  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormSchema) => {
    await login(data.email, data.password);
  };

  return (
    <Card className="overflow-hidden p-0 min-w-md">
      <CardContent className="">
        <Form {...form}>
          <form
            className="p-12 lg:px-12 xl:px-24"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-center">
                  Login to your account
                </h1>
              </div>
              <FormInput
                form={form}
                name={LoginFormFields.Email}
                label="Email"
                placeholder="john@example.com"
              />
              <FormInput
                form={form}
                name={LoginFormFields.Password}
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
              <Button type="submit" className="w-full">
                Login
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary">
                  Sign Up
                </Link>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;

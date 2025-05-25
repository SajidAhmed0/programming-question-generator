"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import {
  CreateUserFormFields,
  createUserFormSchema,
  CreateUserFormSchema,
} from "./validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/form-input";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const RegisterPage = () => {
  const { createUser } = useAuth();

  const form = useForm<CreateUserFormSchema>({
    resolver: zodResolver(createUserFormSchema),
  });

  const onSubmit = async (data: CreateUserFormSchema) => {
    await createUser(data.fullName, data.email, data.password);
  };

  return (
    <Card className="overflow-hidden p-0 min-w-md lg:w-4/5">
      <CardContent className="grid p-0 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 h-full w-full bg-linear-to-r from-[#6352EC] to-[#9a6ac4] opacity-60" />
          <div className="absolute inset-0 h-full w-4/5 m-auto mt-20 z-20">
            <h1 className="text-4xl font-bold text-background">
              Welcome To Quiz App
            </h1>
            <p className="mt-2 text-background font-semibold">
              {
                "Welcome to Quiz App! Challenge your knowledge, test your skills, and climb the leaderboard. Register now to unlock exciting quizzes, track your progress, and compete with friends. Let's get started!"
              }
            </p>
          </div>
          <Image
            src="/images/register.png"
            alt="Image"
            width={500}
            height={500}
            className="absolute inset-0 h-full w-full object-cover rotate-180 opacity-50"
          />
        </div>
        <Form {...form}>
          <form
            className="p-12 lg:px-12 xl:px-24"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">Create an account</h1>
              </div>
              <FormInput
                form={form}
                name={CreateUserFormFields.FullName}
                label="Full Name"
                placeholder="John Doe"
              />
              <FormInput
                form={form}
                name={CreateUserFormFields.Email}
                label="Email Address"
                placeholder="john@example.com"
              />
              <FormInput
                form={form}
                name={CreateUserFormFields.Password}
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
              <FormInput
                form={form}
                name={CreateUserFormFields.ConfirmPassword}
                label="Confirm Password"
                placeholder="Confirm your password"
                type="password"
              />
              <Button type="submit" className="w-full">
                Create an account
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary">
                  Log In
                </Link>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RegisterPage;

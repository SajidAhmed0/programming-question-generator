"use client";

import PageLoader from "@/components/shared/loader";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      redirect("/");
    }
  }, [isLoading, user]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <h1 className="text-center">You are already logged in</h1>
        <p className="text-center">Redirecting to home...</p>
      </div>
    );
  }
  return (
    <div className="bg-linear-to-r from-[#6352EC] to-[#C36AC4] flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      {children}
    </div>
  );
};

export default AuthLayout;

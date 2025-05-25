"use client";

import Footer from "@/components/shared/footer";
import Header from "@/components/shared/header";
import PageLoader from "@/components/shared/loader";
import { useAuth } from "@/context/AuthContext";
import { redirect, usePathname } from "next/navigation";
import React, { useEffect } from "react";

const HomeLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/quiz/result") {
      redirect("/login");
    }
  }, [isLoading, user, pathname]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user && pathname !== "/quiz/result") {
    return <div className="text-center">Redirecting to login...</div>;
  }
  return (
    <div className="flex flex-col min-h-svh">
      <Header />
      <div className="bg-background p-8">{children}</div>
      <div className="flex-1" />
      <Footer />
    </div>
  );
};

export default HomeLayout;

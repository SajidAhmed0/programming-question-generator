"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PAGE_LINKS } from "@/constants";

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <div className="flex px-12 bg-[#16325B] h-20 items-center">
      <Image
        src="/images/logo.png"
        alt="Logo"
        width={160}
        height={37}
        className="object-contain"
      />
      <div className="w-16" />
      {PAGE_LINKS.map((item) => (
        <Link href={item.href} key={item.href} className="text-white mx-4">
          {item.label}
        </Link>
      ))}
      <div className="flex-1" />

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-10 h-10">
              <AvatarImage src="/images/avatar.png" />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-w-64 mr-8">
            <DropdownMenuLabel className="flex items-start gap-3">
              <div className="flex min-w-0 flex-col">
                <span className="text-foreground truncate text-sm font-medium">
                  {user?.displayName}
                </span>
                <span className="text-muted-foreground truncate text-xs font-normal">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default Header;

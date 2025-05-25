import { PAGE_LINKS, SOCIAL_LINKS } from "@/constants";
import { DynamicIcon } from "lucide-react/dynamic";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="flex flex-col bg-[#16325B] h-64 items-center justify-center gap-8">
      <div>
        {PAGE_LINKS.map((item) => (
          <Link href={item.href} key={item.href} className="text-white mx-4">
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex">
        {SOCIAL_LINKS.map((item) => (
          <Link href={item.href} key={item.href} className="text-white mx-2">
            <DynamicIcon size={20} name={item.icon} />
          </Link>
        ))}
      </div>
      <p className="text-white mt-6">QuizApp @ 2025. All rights reserved.</p>
    </div>
  );
};

export default Footer;

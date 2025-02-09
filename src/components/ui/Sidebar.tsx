'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconMusic } from "@tabler/icons-react";

export const FloatingNav = ({ navItems }: { navItems: NavItem[] }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      animate={{ 
        width: isOpen ? "240px" : "70px",
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="flex flex-col h-screen bg-[#1E1F22] fixed top-0 left-0 z-50 overflow-hidden"
    >
      <div className="p-3 h-14 flex items-center">
        <div className="min-w-[40px] flex items-center justify-center">
          <IconMusic 
            size={24} 
            className="text-purple-500"
          />
        </div>
        <motion.h2
          animate={{ 
            opacity: isOpen ? 1 : 0,
            x: isOpen ? 0 : -20
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-white font-bold whitespace-nowrap"
        >
          PinTunes
        </motion.h2>
      </div>
      
      <div className="flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.link}
            className={cn(
              "flex items-center h-12 rounded-md transition-colors relative group",
              pathname === item.link 
                ? "bg-[#404249] text-white" 
                : "text-gray-400 hover:bg-[#35363C] hover:text-white"
            )}
          >
            <div className="min-w-[70px] flex items-center justify-center">
              {item.icon}
            </div>
            <motion.span
              animate={{ 
                opacity: isOpen ? 1 : 0,
                x: isOpen ? 0 : -10
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="whitespace-nowrap pr-4 font-medium text-sm"
            >
              {item.name}
            </motion.span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export type NavItem = {
  name: string;
  link: string;
  icon: React.ReactNode;
};
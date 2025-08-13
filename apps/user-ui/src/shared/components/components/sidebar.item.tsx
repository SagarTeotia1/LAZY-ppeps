'use client';
import React from 'react';
import Link from 'next/link';

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href: string;
}

const SidebarItem = ({ icon, title, isActive, href }: Props) => {
  return (
    <Link href={href} className="my-2 block">
      <div
        className={`flex gap-2 w-full min-h-12 items-center px-[13px] py-2 rounded-lg cursor-pointer transition-colors 
        ${isActive ? 'scale-[.98] bg-[#0f3158] text-blue-200 hover:bg-[#0f3158d6]' : 'hover:bg-[#2b2f31] text-slate-200'}`}
      >
        <div className="text-xl">{icon}</div>
        <h5 className="text-sm">{title}</h5>
      </div>
    </Link>
  );
};

export default SidebarItem;

'use client';
import Link from 'next/link';
import { AlignLeft, ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { navItems } from '../../configs/constants';
import ProfileIcon from '../../assets/svgs/profile-icon';
import HeartIcon from '../../assets/svgs/heart-icon';
import CartIcon from '../../assets/svgs/cart-icon';
import useUser from '../../hooks/useUser'; 

const HeaderBottom = () => {
  const [show, setshow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const {user, isLoading} = useUser();
 


  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 z-[100] bg-white shadow-lg' : 'relative'
      }`}
    >
      {/* Header Nav Bar */}
      <div
        className={`w-[80%] mx-auto relative flex items-center justify-between ${
          isSticky ? 'py-3' : 'py-0'
        }`}
      >
        {/* Left: All Departments */}
        <div className="flex-shrink-0 relative z-20">
          <div
            className="w-[260px] cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]"
            onClick={() => setshow(!show)}
          >
            <div className="flex items-center gap-2">
              <AlignLeft color="white" />
              <span className="text-white font-medium">All Departments</span>
            </div>
            <ChevronDown color="white" />
          </div>

          {/* Dropdown Panel */}
          {show && (
            <div
              className={`absolute left-0 ${
                isSticky ? 'top-[70px]' : 'top-[50px]'
              } w-[260px] h-[100px] bg-[#aba3a3] z-50`}
            ></div>
          )}
        </div>

        {/* Center: Navigation Items */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-[45%] -translate-y-1/2 flex gap-6 z-10">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-lg font-medium whitespace-nowrap"
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* Right: Login + Wishlist + Cart (only if sticky) */}
        {isSticky && (
                  <div className="flex items-center gap-8">
          {/* User Section */}
          <div className="flex items-center gap-2">
            {!isLoading && user ? (
              <>
                <Link
                  href={"/profile"}
                  className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                >
                  <ProfileIcon />
                </Link>
                <Link href={"/profile"}>
                  <span className="block font-medium">Hello</span>
                  <span className="font-semibold">{user?.name?.split(" ")[0]}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                >
                  <ProfileIcon />
                </Link>
                <Link href="/login">
                  <span className="block font-medium">Hello</span>
                  <span className="font-semibold">{isLoading? "..." : "Sign In"}</span>
                </Link>
              </>
            )}
          </div>

          {/* Wishlist & Cart */}
          <div className="flex items-center gap-5">
            <Link href="/Wishlist" className="relative">
              <HeartIcon className="w-6 h-6 text-gray-800" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold leading-none">
                  0
                </span>
              </div>
            </Link>

            <Link href="/cart" className="relative">
              <CartIcon />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold leading-none">
                  0
                </span>
              </div>
            </Link>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default HeaderBottom;
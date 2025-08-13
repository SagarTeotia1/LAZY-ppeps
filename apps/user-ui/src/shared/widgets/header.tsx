'use client';
import Link from 'next/link';
import React from 'react';
import { Search } from 'lucide-react';
import HeartIcon from '../../assets/svgs/heart-icon';
import ProfileIcon from '../../assets/svgs/profile-icon';
import CartIcon from '../../assets/svgs/cart-icon';
import HeaderBottom from './header-bottom';
import useUser from '../../hooks/useUser';

const Header = () => {
  const { user, isLoading } = useUser();
  console.log(user);

  return (
    <div className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        {/* Logo */}
        <div>
          <Link href="/">
            <span className="text-3xl font-[500]">LazyCheck</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search for product..."
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489ff] absolute top-0 right-0">
            <Search color="#fff" />
          </div>
        </div>

        {/* User, Wishlist, Cart */}
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
      </div>

      <div className="border-b border-b-slate-[#99999938]" />
      <HeaderBottom />
    </div>
  );
};

export default Header;

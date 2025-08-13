'use client';
import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Hero = () => {
  const router = useRouter();

  return (
    <div className="bg-[#115061] h-[85vh] flex flex-col justify-center px-4 md:px-0">
      <div className="md:w-[80%] w-full m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-Roboto font-normal text-white pb-2 text-lg md:text-xl">
            Starting from <span className="text-yellow-400">$40</span>
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-extrabold font-Roboto leading-tight md:leading-tight">
            The Best Watch Collection 2025
          </h1>
          <p className="font-Oregano text-2xl md:text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10%</span> off this week
          </p>
          <br />
          <button
            onClick={() => router.push("/products")}
            className="w-[160px] h-[48px] bg-yellow-400 text-[#115061] hover:bg-yellow-500 hover:text-white font-semibold rounded-md flex justify-center items-center gap-2 transition duration-300 ease-in-out"
          >
            Shop Now <MoveRight />
          </button>
        </div>

        <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
          <div className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-lg shadow-lg overflow-hidden">
            <Image
              src="https://ik.imagekit.io/7lzd57wvb/products/product-1752761439879_BohHUpKV2V.jpg?updatedAt=1752761441998"
              alt="Watch Collection"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

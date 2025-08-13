'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../utils/axiosinstance';
import PostCard from '../../../shared/components/cards/post-card';
import SectionTitle from '../../../shared/components/sections/secetion-title';

const CommunityPage = () => {
  const { data: allPosts, isLoading: allLoading } = useQuery({
    queryKey: ['all-posts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/community/api/get-all-post');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="bg-[#f5f5f5] py-10 min-h-screen">
      <div className="max-w-3xl w-full mx-auto">
        <SectionTitle title="Suggested Posts" />

        {allLoading ? (
          <div className="flex flex-col gap-4 mt-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-[200px] bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6 mt-6">
            {allPosts?.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;

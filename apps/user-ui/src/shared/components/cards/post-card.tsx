'use client';
import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Eye, MessageCircle, Clock } from 'lucide-react';
import Image from 'next/image';

const PostCard = ({ post }: { post: any }) => {
  const [open, setOpen] = useState(false);
  const votes = post?.votes ?? 0;

  return (
    <div className="bg-white w-full rounded-xl shadow hover:shadow-md transition-shadow px-4 py-3 flex flex-col gap-3 border border-gray-200">
      
      {/* Top Section: User and View */}
      <div className="flex justify-between items-start text-xs text-gray-500">
        <span>
          Posted by <span className="font-medium">{post?.user?.name || 'Anonymous'}</span> •{' '}
          {new Date(post?.createdAt).toLocaleDateString()}
        </span>
        <button
          className="p-1 rounded-full hover:bg-gray-100 transition"
          onClick={() => setOpen(!open)}
        >
          <Eye className="text-gray-600" size={18} />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900">{post?.title || 'Untitled'}</h3>

      {/* Image */}
      {post?.images?.[0]?.url && (
        <div className="w-full h-[180px] rounded-md overflow-hidden">
          <Image
            src={post.images[0].url}
            alt="Post"
            width={600}
            height={180}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <p className="text-sm text-gray-700 line-clamp-3">{post?.content || 'No content provided.'}</p>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
        {/* Voting */}
        <div className="flex items-center gap-2">
          <ArrowBigUp className="cursor-pointer hover:text-red-500" size={20} />
          <span className="font-medium">{votes}</span>
          <ArrowBigDown className="cursor-pointer hover:text-blue-500" size={20} />
        </div>

        {/* Comments & Time */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1">
            <MessageCircle size={14} />
            <span>{post?.comments?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

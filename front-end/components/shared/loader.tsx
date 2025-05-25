"use client";

import React from "react";

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen absolute top-0 left-0 right-0 bottom-0 bg-white -z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default PageLoader;

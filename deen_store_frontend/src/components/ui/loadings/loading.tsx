// @/components/common/Loading.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white z-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-blue-600 text-lg font-medium">Please wait, loading...</p>
      </div>
    </div>
  );
};

export default Loading;
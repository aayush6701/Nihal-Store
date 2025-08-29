"use client";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

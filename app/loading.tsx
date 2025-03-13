import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#020609] z-50">
      <div className="w-full max-w-md p-8 space-y-4 text-center">
        <div className="flex items-center justify-center">
          <div className="h-16 w-16 relative">
            <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-1 border-t-4 border-green-400 rounded-full animate-spin animate-delay-150"></div>
            <div className="absolute inset-2 border-t-4 border-yellow-300 rounded-full animate-spin animate-delay-300"></div>
            <div className="absolute inset-3 border-t-4 border-red-500 rounded-full animate-spin animate-delay-500"></div>
          </div>
        </div>
        <Skeleton className="h-8 w-48 mx-auto bg-gray-700" />
        <Skeleton className="h-4 w-64 mx-auto bg-gray-700" />
      </div>
    </div>
  );
}

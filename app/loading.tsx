import { Skeleton } from "@/components/ui/skeleton";
import Loader from "@/components/Loader";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#020609] z-50">
      <div className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="flex items-center justify-center">
          <Loader />
        </div>
        <div className="mt-4 space-y-4">
          <Skeleton className="w-48 h-8 mx-auto bg-gray-700" />
          <Skeleton className="w-64 h-4 mx-auto bg-gray-700" />
          <div className="mt-4 text-sm text-gray-400 animate-pulse">
            Loading your experience...
          </div>
        </div>
      </div>
    </div>
  );
}

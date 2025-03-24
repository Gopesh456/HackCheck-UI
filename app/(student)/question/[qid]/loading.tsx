import { Skeleton } from "@/components/ui/skeleton";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Loading() {
  return (
    <div className="bg-[#020609] text-white h-[100vh] overflow-hidden">
      {/* Navbar skeleton */}
      <div className="flex items-center h-16 px-6 border-b border-gray-800">
        <Skeleton className="w-32 h-8 bg-gray-700" />
        <div className="flex-1"></div>
        <div className="flex gap-4">
          <Skeleton className="w-24 h-8 bg-gray-700" />
          <Skeleton className="w-8 h-8 bg-gray-700 rounded-full" />
        </div>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        className="max-w-md rounded-lg md:min-w-full h-dvh"
      >
        <ResizablePanel defaultSize={45}>
          <div className="h-[90vh] p-6 prose prose-invert max-w-none overflow-y-auto">
            <Skeleton className="w-3/4 h-10 mb-4 bg-gray-700" />
            <Skeleton className="w-full h-4 mb-2 bg-gray-700" />
            <Skeleton className="w-5/6 h-4 mb-2 bg-gray-700" />
            <Skeleton className="w-4/6 h-4 mb-6 bg-gray-700" />

            <Skeleton className="w-2/3 h-6 mb-3 bg-gray-700" />
            <div className="ml-4">
              <Skeleton className="w-5/6 h-4 mb-2 bg-gray-700" />
              <Skeleton className="w-4/6 h-4 mb-2 bg-gray-700" />
              <Skeleton className="w-3/4 h-4 mb-6 bg-gray-700" />
            </div>

            <Skeleton className="w-2/3 h-6 mb-3 bg-gray-700" />
            <div className="ml-4">
              <Skeleton className="w-5/6 h-4 mb-2 bg-gray-700" />
              <Skeleton className="w-3/4 h-4 mb-2 bg-gray-700" />
            </div>

            {/* Code block skeleton */}
            <div className="p-4 my-6 rounded-md bg-zinc-800">
              <Skeleton className="w-3/4 h-4 mb-2 bg-gray-700" />
              <Skeleton className="w-1/2 h-4 mb-2 bg-gray-700" />
              <Skeleton className="w-5/6 h-4 bg-gray-700" />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="w-[0.2rem] dark" />
        <ResizablePanel defaultSize={55}>
          <div className="w-full p-6 overflow-y-auto h-[90vh]">
            <div className="flex justify-end w-full gap-2 bg-[#151616] mb-3 rounded-md p-2">
              <Skeleton className="w-20 bg-gray-700 h-9" />
              <Skeleton className="w-20 bg-gray-700 h-9" />
              <Skeleton className="w-20 bg-gray-700 h-9" />
              <Skeleton className="w-32 bg-gray-700 h-9" />
            </div>

            {/* Code editor skeleton */}
            <div className="animate-pulse h-[60vh] w-full bg-[#1e1e1e] rounded-md flex items-center justify-center">
              <div className="w-full px-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-16 h-4 bg-gray-700 rounded"></div>
                  <div className="w-24 h-4 bg-gray-700 rounded"></div>
                  <div className="w-20 h-4 bg-gray-700 rounded"></div>
                </div>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex gap-3 mb-2">
                    <div className="w-8 h-4 bg-gray-700 rounded"></div>
                    <div
                      className="h-4 bg-gray-700 rounded"
                      style={{ width: `${Math.random() * 60 + 20}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom buttons skeleton */}
            <div className="flex w-full gap-2 bg-[#151616] my-3 rounded-md p-2">
              <div className="flex justify-between w-full">
                <Skeleton className="w-40 bg-gray-700 h-9" />
                <div className="flex gap-2">
                  <Skeleton className="bg-gray-700 h-9 w-28" />
                  <Skeleton className="w-32 bg-gray-700 h-9" />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

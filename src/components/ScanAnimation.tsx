"use client";

export default function ScanAnimation() {
  return (
    <div className="w-full max-w-md mx-auto py-12">
      <div className="relative">
        {/* Card outline */}
        <div className="w-full aspect-[1.586/1] border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 overflow-hidden relative">
          {/* Scan line */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan" />

          {/* Placeholder elements */}
          <div className="p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-16 h-20 bg-blue-100 rounded animate-pulse" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-blue-100 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-blue-100 rounded w-1/2 animate-pulse" style={{ animationDelay: "0.1s" }} />
                <div className="h-3 bg-blue-100 rounded w-2/3 animate-pulse" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-blue-100 rounded w-full animate-pulse" style={{ animationDelay: "0.3s" }} />
              <div className="h-2 bg-blue-100 rounded w-5/6 animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>

          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400 rounded-tl" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400 rounded-tr" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400 rounded-bl" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400 rounded-br" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
        <p className="text-sm text-slate-500 mt-3 font-medium">Scanning document...</p>
        <p className="text-xs text-slate-400 mt-1">Analyzing layout, extracting fields, checking compliance</p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: calc(100% - 2px); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

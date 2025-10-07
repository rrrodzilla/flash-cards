interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  className = '',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 animate-pulse';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SessionPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <header className="bg-white shadow-sm border-b-2 border-blue-100 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Skeleton variant="rectangular" width="44px" height="44px" />
            <div className="space-y-2">
              <Skeleton variant="text" width="120px" height="24px" />
              <Skeleton variant="text" width="80px" height="16px" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton variant="text" width="80px" height="32px" />
            <Skeleton variant="text" width="60px" height="12px" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-4">
          <Skeleton variant="rectangular" width="100%" height="12px" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <Skeleton variant="rectangular" width="100%" height="80px" />
          <Skeleton variant="card" width="100%" height="400px" />
        </div>
      </main>
    </div>
  );
}

export function ReportsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm border-b-2 border-blue-100">
        <div className="flex items-center gap-4 p-4">
          <Skeleton variant="rectangular" width="44px" height="44px" />
          <div className="space-y-2">
            <Skeleton variant="text" width="200px" height="28px" />
            <Skeleton variant="text" width="180px" height="16px" />
          </div>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" width="100%" height="120px" />
          ))}
        </div>

        <Skeleton variant="card" width="100%" height="200px" className="mb-8" />

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Skeleton variant="card" width="100%" height="380px" />
          <Skeleton variant="card" width="100%" height="380px" />
        </div>

        <Skeleton variant="card" width="100%" height="400px" />
      </main>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" width="64px" height="64px" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="150px" height="24px" />
          <Skeleton variant="text" width="100px" height="16px" />
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width="48px" height="48px" />
            <Skeleton variant="text" width="80px" height="16px" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width="100%" height="52px" />
          <Skeleton variant="rectangular" width="52px" height="52px" />
        </div>
        <Skeleton variant="rectangular" width="100%" height="44px" />
      </div>
    </div>
  );
}

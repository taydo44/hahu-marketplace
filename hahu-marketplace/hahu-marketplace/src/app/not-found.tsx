import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-display text-8xl text-teff-200 mb-6 select-none">ሐ</div>
        <h1 className="font-display text-5xl text-axum-800 mb-3">Page Not Found</h1>
        <p className="text-axum-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary">Go Home</Link>
          <Link href="/browse" className="btn btn-secondary">Browse Services</Link>
        </div>
      </div>
    </div>
  );
}

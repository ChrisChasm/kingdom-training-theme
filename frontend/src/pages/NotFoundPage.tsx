import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-custom py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  );
}


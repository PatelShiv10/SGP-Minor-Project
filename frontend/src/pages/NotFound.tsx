
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-teal opacity-20">404</h1>
          <h2 className="text-3xl font-bold text-navy mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-teal hover:bg-teal-light text-white">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

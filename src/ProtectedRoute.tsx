import { useAuth, SignIn } from '@clerk/clerk-react';
import './ProtectedRoute.css'

// Define the type for the children prop
interface ProtectedRouteProps {
  children: React.ReactNode; // Define the children type
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useAuth();

  // While Clerk is loading, show a loading spinner
  if (!isLoaded) {
    return (
      <div className="loading-spinner">
        {/* You can customize the spinner as needed */}
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  // If the user is not signed in, show the Clerk sign-in popup
  if (!isSignedIn) {
    return (
      <div>
        <SignIn path="/sign-in" routing="path" redirectUrl="/" />
      </div>
    );
  }

  // If the user is signed in, render the children (the protected route)
  return <>{children}</>;
};

export default ProtectedRoute;
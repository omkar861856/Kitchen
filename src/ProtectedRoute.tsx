import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, isKitchen } = useAppSelector((state) => state.auth);

  // If the user is not authenticated, redirect to the login page
  if (!isLoggedIn && !isKitchen) {
    return <Navigate to={`/signin`} replace />;
  }
  // If the user is authenticated, render the children (protected content)
  return <>{children}</>;
};

export default ProtectedRoute;
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { testAuth } from '../api/AuthApiClient';
import Loader from './Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string; // Optional prop for specifying redirect path
}

const ProtectedRoute = ({ children, redirectPath = '/welcome' }: ProtectedRouteProps) => {
  const [isAllowed, setIsAllowed] = React.useState<null | boolean>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await testAuth();
      setIsAllowed(authStatus.ok);
    };

    checkAuth();
  }, []);

  if (isAllowed === null) {
    return <Loader/>; // Or any other loading state component
  }

  return isAllowed ? children : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;

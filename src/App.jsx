// Main app with global error boundary
import { useAuth } from './contexts/AuthContext';
import AuthContainer from './components/auth/AuthContainer';
import AuthenticatedApp from './components/AuthenticatedApp';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      {currentUser ? <AuthenticatedApp /> : <AuthContainer />}
    </ErrorBoundary>
  );
}

export default App;

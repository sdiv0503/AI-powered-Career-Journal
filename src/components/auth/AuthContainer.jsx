// Container that handles switching between login and signup
// Why separate container? Manages state between the two forms

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthContainer() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(prev => !prev);
  };

  return isLoginMode ? (
    <LoginForm onToggleMode={toggleMode} />
  ) : (
    <SignupForm onToggleMode={toggleMode} />
  );
}

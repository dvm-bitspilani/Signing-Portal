import { useContext, createContext, useState } from "react";

const SignInContext = createContext();

export default SignInContext;

export const useSignIn = () => {
  return useContext(SignInContext);
};

export const SignInProvider = ({ children }) => {
  const [isSignIn, setIsSignIn] = useState(false);
  const signIn = () => {
    setIsSignIn(true);
  };
  const signOut = () => {
    setIsSignIn(false);
  };

  return (
    <SignInContext.Provider value={{ isSignIn, signIn, signOut }}>
      {children}
    </SignInContext.Provider>
  );
};

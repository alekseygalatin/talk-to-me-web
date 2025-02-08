import { useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth/lib/types";

interface LoginFormProps {
  email: string;
  password: string;
  setEmail: (message: string) => void;
  setPassword: (message: string) => void;
  setError: (error: string) => void;
  setIsConfirming: (isConfirming: boolean) => void;
  setIsSignInTab: (isSignInTab: boolean) => void;
  setIsForgotPassword: (isForgotPassword: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  setEmail,
  setPassword,
  setError,
  setIsConfirming,
  setIsSignInTab,
  setIsForgotPassword,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      setIsRequesting(true);
      await Auth.signIn(email, password);
      navigate("/select-partner");
    } catch (err: any) {
      console.log(String(err).includes("User is not confirmed"));
      if (String(err).includes("User is not confirmed")) {
        setError("Confirm your account");
        setIsConfirming(true);
        setIsSignInTab(false);
      } else {
        setError(
          "Failed to sign in. Please check your credentials and try again."
        );
      }

      console.error("Error signing in:", err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google,
      });
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-6 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 focus:outline-none"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? (
                <EyeOffIcon className="w-6 h-6" />
              ) : (
                <EyeIcon className="w-6 h-6" />
              )}
            </button>
          </div>
          <span
            className="text-sm font-medium text-blue-700 dark:text-blue-400 cursor-pointer inline-block mt-2"
            onClick={() => setIsForgotPassword(true)}
          >
            Forgot password?
          </span>
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
          disabled={isRequesting}
        >
          {isRequesting ? (
            <div className="mx-2 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="inline-flex items-center justify-center w-full">
        <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
        <span className="absolute px-3 uppercase font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-800">
          or
        </span>
      </div>
      <button
        type="button"
        className="w-full py-3 px-4 justify-center text-center inline-flex items-center me-2 mb-2 font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        onClick={handleGoogleSignIn}
      >
        <svg
          className="w-4 h-4 me-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 18 19"
        >
          <path
            fillRule="evenodd"
            d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
            clipRule="evenodd"
          />
        </svg>
        Continue with Google
      </button>
      <button
        type="button"
        className="w-full py-3 px-4 justify-center text-center inline-flex items-center me-2 mb-2 font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
      >
        <svg
          className="w-5 h-5 me-2 -ms-1"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="apple"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
        >
          <path
            fill="currentColor"
            d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
          ></path>
        </svg>
        Continue with Apple
      </button>
    </>
  );
};

export default LoginForm;

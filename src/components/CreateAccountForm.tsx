import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface CreateAccountFormProps {
  email: string;
  password: string;
  setEmail: (message: string) => void;
  setPassword: (message: string) => void;
  setError: (error: string) => void;
  setMessage: (error: string) => void;
  setIsConfirming: (isConfirming: boolean) => void;
}

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  email,
  password,
  setEmail,
  setPassword,
  setError,
  setMessage,
  setIsConfirming,
}) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  const togglePasswordConfirmVisibility = () => {
    setIsPasswordConfirmVisible((prevState) => !prevState);
  };

  const handleRegister = async (event: React.FormEvent) => {
    return;
    event.preventDefault();
    setIsRequesting(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsRequesting(false);
      return;
    }
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
        },
      });
      setIsConfirming(true);
    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6 mt-4">
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Confirm password
        </label>
        <div className="relative">
          <input
            type={isPasswordConfirmVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Comfirm your password"
            required
          />
          <button
            type="button"
            onClick={togglePasswordConfirmVisibility}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 focus:outline-none"
            aria-label={
              isPasswordConfirmVisible ? "Hide password" : "Show password"
            }
          >
            {isPasswordConfirmVisible ? (
              <EyeOffIcon className="w-6 h-6" />
            ) : (
              <EyeIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
        disabled={isRequesting}
      >
        {isRequesting ? (
          <div className="mx-2 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          "Register"
        )}
      </button>
    </form>
  );
};

export default CreateAccountForm;

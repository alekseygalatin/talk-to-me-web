import React, { useState } from "react";
import { Auth } from 'aws-amplify';

interface ForgotPasswordFormProps {
    email: string;
    setEmail: (message: string) => void;
    setError: (error: string) => void;
    setMessage: (message: string) => void;
    setIsForgotPassword: (isForgotPassword: boolean) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ email, setEmail, setError, setMessage, setIsForgotPassword }) => {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1); // 1: Request reset, 2: Submit new password
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequestReset = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsRequesting(true);

        const limit = 2; // Maximum attempts
        const timeWindow = 3600 * 1000; // 1 hour in milliseconds
        const requestData = JSON.parse(localStorage.getItem("forgotPasswordAttempts") || "{}");
        const now = Date.now();

        // Check existing attempts
        if (requestData[email] && requestData[email].count >= limit) {
            const timeSinceFirstAttempt = now - requestData[email].firstAttemptTimestamp;
            if (timeSinceFirstAttempt < timeWindow) {
            setError("You have reached the maximum number of attempts. Please try again later.");
            setIsRequesting(false);
            return;
            } else {
            // Reset count after time window
            requestData[email] = { count: 0, firstAttemptTimestamp: now };
            }
        }
        
        try {
            await Auth.forgotPassword(email);
            setMessage("Password reset code sent to your email.");

            // Update request count
            if (!requestData[email]) {
                requestData[email] = { count: 1, firstAttemptTimestamp: now };
            } else {
                requestData[email].count += 1;
            }
            localStorage.setItem("forgotPasswordAttempts", JSON.stringify(requestData));

            setError("");
            setStep(2); // Move to the next step

        } catch (err: any) {
            console.error("Error requesting password reset:", err);
            setMessage("");
            setError(err.message || "Failed to request password reset. Please try again.");
        } finally{
            setIsRequesting(false);
        }
    };

    const handleResetPassword = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsRequesting(true);

        try {
        await Auth.forgotPasswordSubmit(email, code, newPassword);
            setMessage("Password reset successful. You can now sign in with your new password.");
            setError("");
            setStep(1); // Reset to the first step
            setIsForgotPassword(false);
        } catch (err: any) {
            console.error("Error resetting password:", err);
            setMessage("");
            setError(err.message || "Failed to reset password. Please try again.");
        } finally{
            setIsRequesting(false);
        }
    };

    return (
        <>
            {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                        Enter your email address and we will send you a code to reset your password
                    </label>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                disabled={isRequesting}>
                    {isRequesting ? (
                    <div className="mx-2 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        'Request password reset'
                    )}
                </button>
            </form>
            )}

            {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmation Code
                </label>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the code sent to your email"
                    required
                />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your new password"
                        required
                    />
                </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              disabled={isRequesting}>
            {isRequesting ? (
                <div className="mx-2 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    'Reset password'
                )}
              
            </button>
          </form>
        )}
        </>
    );
};

export default ForgotPasswordForm;
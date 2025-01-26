import { useEffect, useState } from "react";
import { Auth } from 'aws-amplify';

interface ConfirmAccountFormProps {
    email: string;
    setError: (error: string) => void;
    setMessage: (error: string) => void;
    setIsConfirming: (isConfirming: boolean) => void;
    setIsSignInTab: (isSignInTab: boolean) => void;
}

const ConfirmAccountForm: React.FC<ConfirmAccountFormProps> = ({ email, setError, setMessage, setIsConfirming, setIsSignInTab }) => {
    const [confirmationCode, setConfirmationCode] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleConfirmSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMessage("");
        setIsRequesting(true);

        try {
    
          await Auth.confirmSignUp(email, confirmationCode);
          setIsConfirming(false);
          setIsSignInTab(true);

        } catch (err: any) {
          console.error('Error confirming sign-up:', err);
          setError(err.message || 'Failed to confirm account. Please try again.');
        } finally{
            setIsRequesting(false);
        }
      };
    
    const handleResendCode = async () => {
        setError('');
        setMessage("");

        try {

            if (cooldown > 0) {
            setError("Please wait before resending the code.");
            return;
            }

            await Auth.resendSignUp(email);
            setMessage("Confirmation code has been resent to your email.");
            setCooldown(60);
        } catch (err: any) {
            console.error("Error resending confirmation code:", err);
            setError(err.message || "Failed to resend confirmation code. Please try again.");
        } 
    };

    return (
        <form onSubmit={handleConfirmSignUp} className="space-y-6">
            <div className='mt-4'>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                Enter the code sent to {email}
            </label>
            <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter the code sent to your email"
                required
            />
            </div>
            <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center"
            disabled={isRequesting}>
                {isRequesting ? (
                <div className="mx-2 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    'Confirm'
                )}
            </button>
            <div className='flex items-center justify-center text-sm font-medium gap-1'>
                <span className='text-gray-700 dark:text-white'>Didn't recieve a code?</span>
                <span className='text-blue-700 dark:text-blue-400 cursor-pointer'
                onClick={() => handleResendCode()}>
                Resend</span>
            </div>
        </form>
      );
};

export default ConfirmAccountForm;
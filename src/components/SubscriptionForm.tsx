import { useEffect, useState } from "react";
import { Subscription } from "../models/Subscription";
import { cancelSubscriptionRequest, requestSubscription, subscriptionRequested } from "../api/subscriptionApi";
import Spinner from "./Spinner";
import { LuSquareCheck, LuSquareX } from "react-icons/lu";

const MAX_CHARACTERS = 500;

const SubscriptionForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await subscriptionRequested();
        const requested = response.data as boolean;
        if (requested) {
          setMessage({ type: "success", text: "Thank you for your request! We appreciate your input." });
        }
        setIsRequested(requested);
      } catch (err: any) {
        const errorMessage = err.response?.status === 409
          ? err.response.data.message
          : "An error occurred while fetching subscription status.";
        setMessage({ type: "error", text: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const subscription: Subscription = { comment };
      await requestSubscription(subscription);
      setMessage({ type: "success", text: "Thank you for your request! We appreciate your input." });
      setComment("");
      setIsRequested(true);
    } catch (err: any) {
      const errorMessage = err.response?.status === 409
        ? err.response.data.message
        : "Error submitting request.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelRequest = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await cancelSubscriptionRequest();
      setIsRequested(false);
    } catch (err: any) {
      const errorMessage = err.response?.status === 409
        ? err.response.data.message
        : "Error cancelling request.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const renderMessage = () => {
    if (!message) return null;
    const colorClasses =
      message.type === "success"
        ? "text-green-600 bg-green-100 border-green-600 dark:text-white dark:bg-green-700 dark:border-green-900"
        : "text-red-600 bg-red-100 border-red-600 dark:text-white dark:bg-red-700 dark:border-red-900";

    return (
      <p className={`text-center text-sm mb-2 border p-2 rounded-lg ${colorClasses}`}>
        {message.text}
      </p>
    );
  };

  return (
    <div className="max-w-lg mx-auto py-6 md:py-8 px-4 md:px-6 bg-white shadow-md rounded-lg dark:bg-gray-800">
      {renderMessage()}

      {isLoading ? (
        <Spinner isLoading={isLoading} global={false} />
      ) : (
        <>
          {isRequested ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleCancelRequest}
              className="max-w-lg py-2 px-4 mt-4 bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center justify-self-center"
            >
              {isSaving ? (
                <div className="mx-2 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LuSquareX className="mx-2 w-6 h-6" /> Cancel Subscription Request
                </>
              )}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <textarea
                className="w-full p-2 min-h-20 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your comment here..."
                value={comment}
                maxLength={MAX_CHARACTERS}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="text-sm text-gray-500 mt-1">
                {comment.length}/{MAX_CHARACTERS} characters
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-40 py-2 px-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isSaving ? (
                  <div className="mx-2 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LuSquareCheck className="mx-2 w-6 h-6" /> Request
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionForm;

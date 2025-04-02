import { useState } from "react";
import { saveFeedback } from "../api/feedbackApi";
import { Feedback } from "../models/Feedback";

const FeedbackForm = () => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const maxCharacters = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    if (!content.trim()) {
      setError("Feedback cannot be empty");
      setIsSaving(false);
      return;
    }

    try {
        const feedback: Feedback = { content: content };
        await saveFeedback(feedback!);
        setSuccess("Thank you for your feedback! We appreciate your input");
        setContent("");
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message);
      } else
      setError("Error submitting feedback.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6 md:py-8 px-4 md:px-6 bg-white shadow-md rounded-lg dark:bg-gray-800">
      {error && <h6 className="text-center text-sm mb-2 text-red-600 dark:text-white bg-red-100 dark:bg-red-700 border border-red-600 dark:border-red-900 p-2 rounded-lg">{error}</h6>}
      {success && <p className="text-center text-sm mb-2 text-green-600 dark:text-white bg-green-100 dark:bg-green-700 border border-green-600 dark:border-green-900 p-2 rounded-lg">{success}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-items-center">
        <textarea
          className="w-full p-2 min-h-40 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Write your feedback here..."
          value={content}
          maxLength={maxCharacters}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="text-sm text-gray-500 mt-1">
          {content.length}/{maxCharacters} characters
        </div>
        <button 
            className="w-40 py-2 px-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            type="submit"
            disabled={isSaving}>
              {isSaving ? (
                <div className="mx-2 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Submit'
              )}
            </button>
      </form>
    </div>
  );
};

export default FeedbackForm;

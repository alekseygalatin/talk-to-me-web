import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface TipsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TipsDialog({ isOpen, onClose }: TipsDialogProps) {
  const tips = [
    {
      title: "Ask Specific Questions",
      description: "The more specific your question, the more detailed and helpful the response will be."
    },
    {
      title: "Voice Input Available",
      description: "Click the microphone icon to use voice commands and dictate your messages."
    },
    {
      title: "Follow-up Questions",
      description: "Feel free to ask follow-up questions to get more clarity or explore related topics."
    },
    {
      title: "Multiple Topics",
      description: "You can ask about various topics, from coding to general knowledge."
    }
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`mx-auto rounded-2xl bg-white text-gray-900 dark:bg-gray-800 dark:text-white p-6 w-full 
          max-w-md shadow-xl transform transition-all`}>
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">
              Tips for Better Interaction
            </Dialog.Title>
            <button
              onClick={onClose}
              className='p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {tips.map((tip, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:scale-[1.02] transition-transform duration-200`}
              >
                <h3 className="font-medium mb-2 text-lg">{tip.title}</h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  {tip.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className='px-6 py-2.5 rounded-xl font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white 
                dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white'
            >
              Got it
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 
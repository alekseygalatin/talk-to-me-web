import { Dialog } from '@headlessui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface IdeaDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (text: string) => void;
    theme: 'light' | 'dark';
}

export function IdeaDialog({ isOpen, onClose, onSelect, theme }: IdeaDialogProps) {
    const isDark = theme === 'dark';
    const [currentIndex, setCurrentIndex] = useState(0);

    const ideas = [
        {
            title: "Sample Text 1",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        },
        {
            title: "Sample Text 2",
            content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        // Add more texts as needed
    ];

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % ideas.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + ideas.length) % ideas.length);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className={`w-full max-w-3xl rounded-lg ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}>
                    <div className="p-6">
                        <Dialog.Title className={`text-xl font-medium mb-4 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            {ideas[currentIndex].title}
                        </Dialog.Title>

                        <div className="relative">
                            {/* Navigation Buttons */}
                            <button
                                onClick={prevSlide}
                                className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            
                            <button
                                onClick={nextSlide}
                                className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Text Content */}
                            <div className="px-12 min-h-[300px] max-h-[60vh] overflow-y-auto">
                                <p className="text-lg leading-relaxed">
                                    {ideas[currentIndex].content}
                                </p>
                            </div>
                        </div>

                        {/* Dots Indicator */}
                        <div className="flex justify-center gap-2 mt-4">
                            {ideas.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        index === currentIndex
                                            ? (isDark ? 'bg-white' : 'bg-gray-800')
                                            : (isDark ? 'bg-gray-600' : 'bg-gray-300')
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 rounded ${
                                    isDark
                                        ? 'bg-gray-700 hover:bg-gray-600'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onSelect(ideas[currentIndex].content)}
                                className={`px-4 py-2 rounded ${
                                    isDark
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                        : 'bg-blue-100 hover:bg-blue-200 text-blue-500'
                                }`}
                            >
                                Select
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 
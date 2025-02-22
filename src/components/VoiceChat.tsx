import {motion} from "framer-motion";
import {Mic, MicOff} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {useAppContext} from "../contexts/AppContext.tsx";
import {useGraphProcessing} from "../core/GraphProcessing.ts";

export enum ConversationState {
    Idling,
    Listening,
    Retrieving,
    Processing,
    Speaking,
}

const VoiceChat: React.FC = () => {
    const [isConverstionStarted, setIsConversationStarted] = useState(false);
    const [conversationState, setConversationState] = useState<ConversationState>(
        ConversationState.Idling
    );
    const [audioBlob, SetAudioBlob] = useState<Blob | null>(null);
    const [statusIndicator, setStatusIndicator] = useState("");
    const audioRef = useRef<HTMLAudioElement | null>(null);


    const {
        startProcessing,
        stopProcessing,
        stopCurrentProcessingStep,
        clearState,
        graphProcessingData,
    } = useGraphProcessing();
    const {preferences} = useAppContext();

    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);

            const audio = new Audio(url);
            audioRef.current = audio;
            audio.play().catch((error) => console.error("Playback error:", error));

            audio.onended = () => {
                URL.revokeObjectURL(url);
            };

            return () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    URL.revokeObjectURL(url);
                    audioRef.current = null;
                }
            };
        }
    }, [audioBlob]);

    useEffect(() => {
        switch (graphProcessingData?.GraphProcessingStatus) {
            case "Idling": {
                setConversationState(ConversationState.Idling);
                setIsConversationStarted(false);
                break;
            }
            case "Transcribing": {
                setConversationState(ConversationState.Listening);
                setIsConversationStarted(true);
                break;
            }
            case "Processing": {
                setConversationState(ConversationState.Processing);
                break;
            }
        }

        if(graphProcessingData?.AudioData){
            setIsConversationStarted(false);
            setConversationState(ConversationState.Speaking);
            SetAudioBlob(graphProcessingData.AudioData);
        }
    }, [graphProcessingData]);

    useEffect(() => {
        switch (conversationState) {
            case ConversationState.Listening:
            case ConversationState.Retrieving: {
                setStatusIndicator("Listening...");
                break;
            }
            case ConversationState.Processing: {
                setStatusIndicator("Processing...");
                break;
            }
            case ConversationState.Speaking: {
                setStatusIndicator("Speaking...");
                break;
            }
            default: {
                setStatusIndicator("Click start to begin conversation");
                break;
            }
        }
    }, [conversationState]);

    const handleStartLiveConversation = async () => {
        setIsConversationStarted(true);
        setConversationState(ConversationState.Listening);
        stopAudio();

        await startProcessing({
            GraphType: "TranscribeWithBedrockAndPolly",
            TranscriberStartParams: {
                continuous: true,
                language: preferences?.currentLanguageToLearn ?? "sv-SE",
            }
        });

        console.log("Starting live conversation...");
    };

    const handleEndLiveConversation = async () => {
        await stopCurrentProcessingStep();
        console.log("Ending live conversation...");
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const generateRandomHeight = () => Math.random() * (32 - 4) + 4;

    return (
        <>
            <div className="flex-1 overflow-y-auto">
                <div className="p-2 md:p-4 h-full">
                    <div className="flex-1 flex items-center justify-center p-4 h-full">
                        <motion.div
                            className="relative w-full max-w-md"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5}}
                        >
                            <div
                                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-white/20">
                                <div className="mb-10 text-center">
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-400 bg-clip-text text-transparent">
                                        Voice Chat
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-base md:text-lg">
                                        Speak naturally in your language
                                    </p>
                                </div>

                                <div className="flex justify-center">
                                    <div
                                        className="w-48 h-48 flex items-center justify-center bg-blue-400 dark:bg-gray-900 text-white rounded-full shadow-lg">
                                        {(conversationState == ConversationState.Listening ||
                                            conversationState == ConversationState.Retrieving) && (
                                            <>
                                                <motion.div
                                                    animate={{scale: [1, 1.2, 1]}}
                                                    transition={{duration: 1.2, repeat: Infinity}}
                                                    className="absolute w-48 h-48 bg-blue-500 opacity-20 rounded-full"
                                                />
                                                <Mic
                                                    className={`w-16 h-16 z-50 text-white dark:text-blue-300 ${
                                                        conversationState == ConversationState.Listening
                                                            ? "opacity-30"
                                                            : ""
                                                    }`}
                                                />
                                            </>
                                        )}

                                        {conversationState == ConversationState.Processing && (
                                            <motion.div
                                                className="flex justify-center gap-3"
                                                initial={{opacity: 0}}
                                                animate={{opacity: 1}}
                                                transition={{duration: 1}}
                                            >
                                                <motion.div
                                                    className="w-4 h-4 rounded-full bg-white dark:bg-blue-300"
                                                    animate={{opacity: [1, 0.5, 1]}}
                                                    transition={{
                                                        duration: 1.2,
                                                        repeat: Infinity,
                                                        delay: 0.0,
                                                    }}
                                                />
                                                <motion.div
                                                    className="w-4 h-4 rounded-full bg-white dark:bg-blue-300"
                                                    animate={{opacity: [1, 0.5, 1]}}
                                                    transition={{
                                                        duration: 1.2,
                                                        repeat: Infinity,
                                                        delay: 0.4,
                                                    }}
                                                />
                                                <motion.div
                                                    className="w-4 h-4 rounded-full bg-white dark:bg-blue-300"
                                                    animate={{opacity: [1, 0.5, 1]}}
                                                    transition={{
                                                        duration: 1.2,
                                                        repeat: Infinity,
                                                        delay: 0.8,
                                                    }}
                                                />
                                            </motion.div>
                                        )}

                                        {conversationState == ConversationState.Speaking && (
                                            <motion.div
                                                className="flex justify-center items-center gap-1 h-32 px-4"
                                                initial={{opacity: 0}}
                                                animate={{opacity: 1}}
                                                transition={{duration: 1}}
                                            >
                                                {[...Array(16)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-1.5 bg-gradient-to-t from-gray-100 to-white dark:from-blue-400 dark:to-blue-300 rounded-full"
                                                        animate={{
                                                            height: [
                                                                generateRandomHeight(),
                                                                generateRandomHeight(),
                                                                generateRandomHeight(),
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 1.2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: i * 0.1,
                                                        }}
                                                        style={{
                                                            opacity: i < 8 ? i / 8 : (16 - i) / 8,
                                                        }}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-10 text-center">
                                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-base md:text-lg">
                                        {statusIndicator}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between gap-2 my-1 px-2">
                <button
                    className="basis-64 py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-2 text-xs md:text-base break-all"
                    type="button"
                    onClick={() => setConversationState(ConversationState.Idling)}
                >
                    Idling
                </button>
                <button
                    className="basis-64 py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-2 text-xs md:text-base break-all"
                    type="button"
                    onClick={() => setConversationState(ConversationState.Listening)}
                >
                    Listening
                </button>
                <button
                    className="basis-64 py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-2 text-xs md:text-base break-all"
                    type="button"
                    onClick={() => setConversationState(ConversationState.Retrieving)}
                >
                    Retrieving
                </button>
                <button
                    className="basis-64 py-4 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-2 text-xs md:text-base break-all"
                    type="button"
                    onClick={() => setConversationState(ConversationState.Processing)}
                >
                    Processing
                </button>
                <button
                    className="basis-64 py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-2 text-xs md:text-base break-all"
                    type="button"
                    onClick={() => setConversationState(ConversationState.Speaking)}
                >
                    Speaking
                </button>
            </div>

            <div
                className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 flex items-start justify-center py-4 px-4"
                style={{
                    paddingBottom: `calc(env(safe-area-inset-bottom) + 0.75rem)`,
                }}
            >
                {isConverstionStarted ? (
                    <button
                        className="w-80 py-4 px-4 my-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-2"
                        type="button"
                        onClick={handleEndLiveConversation}
                    >
                        <MicOff className="w-5 h-5"/> End Conversation
                    </button>
                ) : (
                    <button
                        className="w-80 py-4 px-4 my-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-2"
                        type="button"
                        onClick={handleStartLiveConversation}
                    >
                        <Mic className="w-5 h-5"/> Start Conversation
                    </button>
                )}
            </div>
        </>
    );
};

export default VoiceChat;

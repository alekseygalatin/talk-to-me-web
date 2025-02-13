import { useState } from "react";
import { useParams } from "react-router-dom";
import { withAuth } from "../components/withAuth";
import "../chat.css";
import { SettingsSidebar } from "../components/SettingsSidebar";
import ChatHeader from "../components/ChatHeader";
import VoiceChat from "../components/VoiceChat.tsx";
import TextChat from "../components/TextChat.tsx";

function Chat() {
  const { partnerId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900"
      style={{
        height: "100dvh",
      }}
    >
      <div
        className="flex flex-col h-full w-full max-w-3xl mx-auto relative"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <ChatHeader openSidebar={() => setIsSidebarOpen(true)} />

        {partnerId === "6" ? <VoiceChat /> : <TextChat partnerId={partnerId} />}
      </div>
      <SettingsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}

export default withAuth(Chat);

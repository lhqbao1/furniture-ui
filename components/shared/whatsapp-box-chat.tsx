"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

const STORAGE_KEY = "whatsapp-chat-open";

export default function WhatsAppChatBox() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const t = useTranslations();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);

  /* 🔹 ALWAYS call hooks first */
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setOpen(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(STORAGE_KEY, String(open));
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [open, mounted]);

  /* 🔹 AFTER all hooks */
  if (!mounted || pathname.includes("/admin")) return null;

  const PHONE_NUMBER = "84988901845";

  const handleSend = () => {
    if (!message.trim()) return;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* ICON FLOAT */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed bottom-6 right-6 z-[1000]
            w-14 h-14 rounded-full
            bg-[#25D366] text-white
            flex items-center justify-center
            shadow-xl
            hover:scale-105 transition-all cursor-pointer duration-300
          "
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* CHAT BOX */}
      <div
        className={`
          fixed bottom-6 right-6 z-[1000]
          w-[340px] rounded-xl shadow-2xl overflow-hidden
          bg-[#ECE5DD]
          transform transition-all duration-300 ease-out
          ${
            open
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95 pointer-events-none"
          }
        `}
      >
        {/* HEADER */}
        <div className="bg-[#075E54] text-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold pointer-events-none relative">
              <Image
                src={"/new-logo.svg"}
                width={30}
                height={30}
                alt=""
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">Prestige Home</p>
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                <div className="text-[11px] text-white/80">Online</div>
              </div>
            </div>
          </div>

          <button onClick={() => setOpen(false)}>
            <X
              size={18}
              className="cursor-pointer hover:scale-105 transition-all duration-300"
            />
          </button>
        </div>

        {/* BODY */}
        <div className="p-3">
          <div className="bg-white rounded-lg p-2 text-xs text-gray-700 mb-2 w-fit max-w-[85%] shadow">
            {t("whatsapp_greeting")}
          </div>

          <textarea
            ref={textareaRef}
            className="
              w-full mt-2 rounded-lg border
              p-2 text-sm resize-none ring-gray-500/35 ring-2
              outline-none focus:ring-2 focus:ring-green-400
            "
            rows={3}
            placeholder={t("whatsapp_placeholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* SEND */}
          <button
            onClick={handleSend}
            className="
              mt-3 w-full rounded-lg
              bg-[#25D366] text-white
              py-2 flex items-center justify-center gap-2
              hover:bg-[#1ebe5d] transition cursor-pointer
            "
          >
            <Send size={16} />
            {t("send")}
          </button>
        </div>
      </div>
    </>
  );
}

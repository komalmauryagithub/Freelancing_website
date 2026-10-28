"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  FileText,
  Download,
  AlertCircle,
  X,
} from "lucide-react";

interface ChatMessage {
  id: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
    role: string;
    avatar?: string | null;
  };
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentSize?: number | null;
  attachmentType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

interface RealtimeChatBoxProps {
  projectRequestId: string;
  projectTitle: string;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  initialMessages?: ChatMessage[];
}

export function RealtimeChatBox({
  projectRequestId,
  projectTitle,
  currentUser,
  initialMessages = [],
}: RealtimeChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Attachment State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connection State
  const [connectionStatus, setConnectionStatus] = useState<
    "CONNECTED" | "CONNECTING" | "RECONNECTING" | "OFFLINE_FALLBACK"
  >("CONNECTING");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Load message history from HTTP API
  const fetchMessageHistory = async () => {
    try {
      const res = await fetch(`/api/portal/projects/${projectRequestId}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data.data?.messages) {
          setMessages(data.data.messages);
        }
      }
    } catch {
      // Ignore background fetch error
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("message:read", { projectRequestId });
      } else {
        await fetch(`/api/portal/projects/${projectRequestId}/messages/read`, {
          method: "PATCH",
        });
      }
    } catch {
      // Ignore read receipt error
    }
  };

  useEffect(() => {
    fetchMessageHistory();
    markMessagesAsRead();
  }, [projectRequestId]);

  // Socket.IO Connection & Reconnection Management
  useEffect(() => {
    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3001";

    let socket: Socket | null = null;
    let fallbackPollInterval: NodeJS.Timeout | null = null;

    try {
      socket = io(realtimeUrl, {
        withCredentials: true,
        reconnectionAttempts: 4,
        reconnectionDelay: 1500,
        timeout: 4000,
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setConnectionStatus("CONNECTED");
        setErrorMsg(null);
        socket?.emit("join:project", { projectRequestId });
      });

      socket.on("connect_error", () => {
        setConnectionStatus("OFFLINE_FALLBACK");
      });

      socket.on("reconnect_attempt", () => {
        setConnectionStatus("RECONNECTING");
      });

      socket.on("disconnect", () => {
        setConnectionStatus("OFFLINE_FALLBACK");
      });

      socket.on("message:new", (newMsg: ChatMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        if (newMsg.senderId !== currentUser.id) {
          markMessagesAsRead();
        }
      });

      socket.on("messages:read", ({ readerId, readAt }: { readerId: string; readAt: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId !== readerId ? { ...m, isRead: true, readAt } : m
          )
        );
      });

      socket.on("typing:update", ({ name, isTyping }: { name: string; isTyping: boolean }) => {
        setTypingUsers((prev) => {
          if (isTyping) {
            return prev.includes(name) ? prev : [...prev, name];
          } else {
            return prev.filter((n) => n !== name);
          }
        });
      });
    } catch {
      setConnectionStatus("OFFLINE_FALLBACK");
    }

    // Set up graceful HTTP polling fallback if offline
    fallbackPollInterval = setInterval(() => {
      if (connectionStatus === "OFFLINE_FALLBACK") {
        fetchMessageHistory();
      }
    }, 4500);

    return () => {
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
      if (socket) {
        socket.emit("leave:project", { projectRequestId });
        socket.disconnect();
      }
    };
  }, [projectRequestId, currentUser.id]);

  // Handle typing debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:start", { projectRequestId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing:stop", { projectRequestId });
      }, 1500);
    }
  };

  // Upload attachment file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg("Attachment size exceeds 15MB limit.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  // Send message handler (via Socket or HTTP fallback)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    setIsSending(true);
    setErrorMsg(null);

    let uploadedAttachment: any = null;

    try {
      // 1. Upload attachment if attached
      if (selectedFile) {
        setIsUploadingFile(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/portal/chat/attachments", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.message || "Failed to upload attachment");
        }

        const uploadData = await uploadRes.json();
        uploadedAttachment = uploadData.data;
        setSelectedFile(null);
        setIsUploadingFile(false);
      }

      const payload = {
        projectRequestId,
        content: inputText.trim(),
        attachmentUrl: uploadedAttachment?.url || null,
        attachmentName: uploadedAttachment?.name || null,
        attachmentSize: uploadedAttachment?.size || null,
        attachmentType: uploadedAttachment?.type || null,
      };

      // 2. Transmit via live socket if connected, or HTTP fallback if offline
      if (socketRef.current?.connected) {
        socketRef.current.emit("message:send", payload, (response: any) => {
          if (!response?.success) {
            setErrorMsg(response?.error || "Error transmitting message");
          } else {
            setInputText("");
          }
          setIsSending(false);
        });
      } else {
        // HTTP API Fallback
        const res = await fetch(`/api/portal/projects/${projectRequestId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.message || "Failed to send message via HTTP fallback");
        }

        const savedMsg = await res.json();
        setMessages((prev) => [...prev, savedMsg.data]);
        setInputText("");
        setIsSending(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error sending message");
      setIsSending(false);
      setIsUploadingFile(false);
    }
  };

  return (
    <div className="flex flex-col h-[560px] rounded-2xl bg-charcoal-900 border border-white/10 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-charcoal-850 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white line-clamp-1">{projectTitle}</h3>
            <Badge variant="violet" size="sm">
              Live Channel
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Encrypted conversation with Studio Engineering
          </p>
        </div>

        {/* Real-time Connection Status Indicator */}
        <div className="flex items-center gap-2">
          {connectionStatus === "CONNECTED" ? (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time</span>
            </div>
          ) : connectionStatus === "RECONNECTING" ? (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Reconnecting</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium bg-charcoal-800 px-2.5 py-1 rounded-full border border-white/10"
              title="Socket server offline. Seamless HTTP fallback sync active."
            >
              <WifiOff className="w-3 h-3 text-slate-400" />
              <span>HTTP Sync</span>
            </div>
          )}
        </div>
      </div>

      {/* Offline Mode Banner (Informative, Non-blocking) */}
      {connectionStatus === "OFFLINE_FALLBACK" && (
        <div className="px-4 py-1.5 bg-charcoal-800/80 border-b border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Real-time socket offline. Messages are saving directly via secure HTTP sync.</span>
          <button
            onClick={() => {
              setConnectionStatus("CONNECTING");
              socketRef.current?.connect();
            }}
            className="text-electric-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Retry Socket</span>
          </button>
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-charcoal-950/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-slate-500 space-y-2">
            <div className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-slate-400 border border-white/10">
              <Send className="w-4 h-4" />
            </div>
            <p>No messages in this project yet.</p>
            <span className="text-[11px] text-slate-600">
              Ask technical questions, discuss requirements, or share design references.
            </span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1.5 ${
                    isMe
                      ? "bg-electric-500 text-charcoal-950 rounded-br-none shadow-md"
                      : "bg-charcoal-850 text-slate-200 border border-white/10 rounded-bl-none"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-4 text-[10px] ${
                      isMe ? "text-charcoal-800 font-semibold" : "text-slate-400"
                    }`}
                  >
                    <span>{isMe ? "You" : msg.sender?.name || "Participant"}</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}

                  {/* Attachment Card */}
                  {msg.attachmentUrl && (
                    <div
                      className={`p-2 rounded-xl flex items-center justify-between gap-3 text-xs border ${
                        isMe
                          ? "bg-charcoal-950/10 border-charcoal-900/20 text-charcoal-950"
                          : "bg-charcoal-900 border-white/10 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate font-semibold text-[11px]">
                          {msg.attachmentName || "Attached File"}
                        </span>
                      </div>
                      <a
                        href={msg.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded hover:bg-white/20 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Read Receipts */}
                  {isMe && (
                    <div className="flex justify-end text-[10px] text-charcoal-800 pt-0.5">
                      {msg.isRead ? (
                        <span className="flex items-center gap-0.5 font-bold" title="Read by recipient">
                          <CheckCheck className="w-3 h-3 text-emerald-800" />
                          <span>Read</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5" title="Delivered to server">
                          <Check className="w-3 h-3" />
                          <span>Sent</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="text-[11px] text-electric-400 italic flex items-center gap-1.5 animate-pulse pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-400" />
            <span>{typingUsers.join(", ")} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="px-4 py-1.5 bg-rose-500/10 border-t border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="p-0.5 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Selected Attachment Preview Bar */}
      {selectedFile && (
        <div className="px-4 py-2 bg-charcoal-850 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Paperclip className="w-3.5 h-3.5 text-electric-400" />
            <span className="truncate max-w-xs font-semibold">{selectedFile.name}</span>
            <span className="text-[10px] text-slate-500">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Composer */}
      <form onSubmit={handleSendMessage} className="p-3 bg-charcoal-850 border-t border-white/10 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,.docx,.txt,.json,.csv"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-charcoal-800 text-slate-400 hover:text-white hover:bg-charcoal-700 transition-colors border border-white/5"
          title="Attach file (PDF, image, zip - max 15MB)"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type a message to studio engineers..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSending || isUploadingFile}
          disabled={!inputText.trim() && !selectedFile}
          icon={<Send className="w-3.5 h-3.5" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
}

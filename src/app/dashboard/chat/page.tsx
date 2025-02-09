'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useUser } from '../../../contexts/UserContext';
import StarryBackground from '../../../components/StarryBackground';
import { FloatingNav } from "@/components/ui/Sidebar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  IconHome,
  IconMusic,
  IconMessages,
  IconLogout,
  IconMicrophone,
  IconMicrophoneOff,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Array<{ text: string; sender: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechQueue = useRef<string[]>([]);
  const synthesis = useRef<SpeechSynthesis | null>(null);

  // nav items
  const navItems = [
    {
      name: "Home",
      link: "/dashboard",
      icon: <IconHome className="h-5 w-5" />,
    },
    {
      name: "Playlistify",
      link: "/dashboard/chat",
      icon: <IconMusic className="h-5 w-5" />,
    },
    {
      name: "Posts",
      link: "/dashboard/posts",
      icon: <IconMessages className="h-5 w-5" />,
    },
    {
      name: "Logout",
      link: "/logout",
      icon: <IconLogout className="h-5 w-5" />,
    },
  ];

  useEffect(() => {
    const initializeChat = async () => {
      if (user?.username && messages.length === 0) {
        setIsInitializing(true);
        try {
          const response = await fetch('/api/aiConversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{ text: 'Hello', sender: 'user' }],
              userCID: user.cid
            }),
          });

          const data = await response.json();
          if (response.ok) {
            setMessages([{ text: data.response, sender: 'ai' }]);
          }
        } catch (error) {
          console.error('Error initializing chat:', error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeChat();
  }, [user]);

  useEffect(() => {
    console.log('Messages:', messages);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setInterimTranscript('');
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let currentInterim = '';

          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setInput(prev => prev + ' ' + finalTranscript.trim());
            setInterimTranscript('');
            recognitionRef.current.stop();
            setIsListening(false);
            setIsProcessing(true);
            setTimeout(() => setIsProcessing(false), 500);
          } else {
            setInterimTranscript(currentInterim);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setIsProcessing(false);
          setInterimTranscript('');
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setIsProcessing(false);
          setInterimTranscript('');
        };
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesis.current = window.speechSynthesis;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (input.trim() === '') return;
    setIsLoading(true);

    const userMessage = { text: input.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await fetch('/api/aiConversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userCID: user?.cid
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setIsTyping(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessages(prev => [...prev, { text: data.response, sender: 'ai' }]);
      setIsTyping(false);

      speak(data.response);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { text: 'Sorry, I encountered an error. Please try again.', sender: 'ai' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 500);
    } else {
      setInput('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speak = (text: string) => {
    if (!synthesis.current || !isTTSEnabled) return;

    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1')
                         .replace(/\*(.*?)\*/g, '$1')
                         .replace(/\[(.*?)\]\(.*?\)/g, '$1')
                         .replace(/`(.*?)`/g, '$1');

    speechQueue.current.push(cleanText);

    if (!isSpeaking) {
      speakNextInQueue();
    }
  };

  const speakNextInQueue = () => {
    if (!synthesis.current || speechQueue.current.length === 0) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const text = speechQueue.current[0];
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onend = () => {
      speechQueue.current.shift();
      speakNextInQueue();
    };

    utterance.onerror = () => {
      console.error('Speech synthesis error');
      setIsSpeaking(false);
      speechQueue.current = [];
    };

    synthesis.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesis.current) {
      synthesis.current.cancel();
      speechQueue.current = [];
      setIsSpeaking(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-black text-white">
      <StarryBackground />
      <FloatingNav navItems={navItems} />
      
      <div className="absolute top-4 right-4 z-50">
        <motion.button
          onClick={() => {
            if (isSpeaking) {
              stopSpeaking();
            }
            setIsTTSEnabled(!isTTSEnabled);
          }}
          className={`p-2 rounded-lg transition-colors ${
            isTTSEnabled ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-600 hover:bg-gray-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isTTSEnabled ? (
            <motion.div
              animate={isSpeaking ? {
                scale: [1, 1.2, 1],
                transition: { duration: 1, repeat: Infinity }
              } : {}}
            >
              <IconVolume className="h-5 w-5" />
            </motion.div>
          ) : (
            <IconVolumeOff className="h-5 w-5" />
          )}
        </motion.button>
      </div>
      
      <main className="flex-1 p-6 ml-20">
        <AnimatePresence mode="wait">
          {isInitializing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  className="text-1xl font-light tracking-wider text-white-200"
                >
                  Loading your music profile...
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col w-full max-w-2xl mx-auto mt-8 rounded-lg shadow-md overflow-hidden z-10"
              style={{ height: 'calc(100vh - 120px)' }}
            >
              {/* Messages */}
              <div
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto space-y-4 p-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        message.sender === 'user' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-[#1E1F22] text-gray-100'
                      }`}
                    >
                      {message.sender === 'ai' ? (
                        <div className="markdown-body">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Style code blocks
                              code({ node, inline, className, children, ...props }) {
                                return (
                                  <code
                                    className={`${inline 
                                      ? 'bg-[#2E2F33] px-1 py-0.5 rounded text-sm' 
                                      : 'block bg-[#2E2F33] p-2 rounded-lg text-sm my-2'
                                    }`}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              p({ children }) {
                                return <p className="mb-1 last:mb-0">{children}</p>;
                              },
                              a({ children, ...props }) {
                                return (
                                  <a
                                    className="text-purple-400 hover:text-purple-300 underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    {...props}
                                  >
                                    {children}
                                  </a>
                                );
                              },
                              ul({ children }) {
                                return <ul className="list-disc list-inside my-1">{children}</ul>;
                              },
                              ol({ children }) {
                                return <ol className="list-decimal list-inside my-1">{children}</ol>;
                              },
                              li({ children }) {
                                return <li className="my-0.5">{children}</li>;
                              }
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        message.text
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="bg-[#1E1F22] rounded-lg p-3 flex items-center space-x-2">
                      <motion.div
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, delay: 0.4, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-[#1E1F22]">
                <div className="flex rounded-lg shadow-sm gap-2">
                  <div className="flex-grow flex flex-col">
                    <div className="flex rounded-lg shadow-sm">
                      <input
                        type="text"
                        className="flex-grow bg-[#2E2F33] text-white rounded-l-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 p-3"
                        placeholder={isListening ? 'Listening...' : 'Type your message...'}
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading || isListening}
                      />
                      <button
                        className="bg-purple-500 text-white rounded-r-lg px-4 py-3 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        onClick={handleSend}
                        disabled={isLoading || isListening}
                      >
                        {isLoading ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                    {interimTranscript && (
                      <div className="mt-2 text-sm text-gray-400 italic">
                        {interimTranscript}
                      </div>
                    )}
                  </div>

                  {speechSupported && (
                    <motion.button
                      onClick={toggleListening}
                      className={`relative p-3 rounded-lg flex items-center justify-center transition-colors ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : isProcessing
                            ? 'bg-yellow-500'
                            : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={isListening ? {
                        scale: [1, 1.1, 1],
                        transition: {
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      } : {}}
                    >
                      {isProcessing ? (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        </motion.div>
                      ) : isListening ? (
                        <IconMicrophoneOff className="w-6 h-6 text-white" />
                      ) : (
                        <IconMicrophone className="w-6 h-6 text-white" />
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

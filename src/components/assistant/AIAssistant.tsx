import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { azureSpeechService } from '../../services/azureSpeechService';
import type { ChatMessage } from '../../types/assistant';
import { FaChevronDown, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Función para renderizar markdown simple
const renderMarkdown = (text: string) => {
    // Convertir **texto** a <strong>texto</strong>
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convertir *texto* a <em>texto</em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Convertir saltos de línea
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
};

interface AIAssistantProps {
    autoOpen?: boolean;
    welcomeMessage?: string;
    onClose?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
    autoOpen = false,
    welcomeMessage,
    onClose
}) => {
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(autoOpen);

    const defaultMessage = '¡Hola! Soy tu asistente virtual del CRM. Puedo ayudarte con preguntas sobre cómo usar el sistema, crear pacientes, consultas, facturas, invitar usuarios, y más. ¿En qué puedo ayudarte?';

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '0',
            role: 'assistant',
            content: welcomeMessage || defaultMessage,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Sync isOpen with autoOpen prop
    useEffect(() => {
        if (autoOpen) {
            setIsOpen(true);
        }
    }, [autoOpen]);

    // Load user data context when assistant opens
    useEffect(() => {
        if (isOpen && currentUser?.uid) {
            aiService.loadUserDataContext(currentUser.uid);
        }
    }, [isOpen, currentUser]);

    // Update welcome message when it changes
    useEffect(() => {
        if (welcomeMessage) {
            setMessages([
                {
                    id: '0',
                    role: 'assistant',
                    content: welcomeMessage,
                    timestamp: new Date()
                }
            ]);
        }
    }, [welcomeMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await aiService.sendMessage(input.trim());

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo o consulta la página de Ayuda.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = () => {
        aiService.clearHistory();
        setMessages([
            {
                id: '0',
                role: 'assistant',
                content: welcomeMessage || defaultMessage,
                timestamp: new Date()
            }
        ]);
    };

    const quickQuestions = [
        '¿Cómo creo un paciente?',
        '¿Cómo invito un usuario?',
        '¿Cómo funciona la facturación?',
        '¿Qué son las notificaciones?'
    ];

    return (
        <>
            {/* Botón flotante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
                    aria-label="Abrir asistente virtual"
                >
                    <img src="/images/isotipo-blanco.png" alt="Vaiston" className="w-8 h-8" />
                </button>
            )}

            {/* Panel del chat */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-border">
                    {/* Header - Fondo sólido sin gradiente */}
                    <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-1.5">
                                <img src="/images/isotipo-blanco.png" alt="Vaiston" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Asistente Virtual</h3>
                                <p className="text-xs opacity-90">Siempre listo para ayudar</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleClearChat}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Limpiar chat"
                            >
                                <FaTrash className="text-sm" />
                            </button>
                            <button
                                onClick={() => {
                                    azureSpeechService.stop();
                                    setIsOpen(false);
                                    onClose?.();
                                }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                aria-label="Minimizar asistente"
                            >
                                <FaChevronDown />
                            </button>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                        ? 'bg-primary text-white'
                                        : 'bg-white border border-border text-text-primary'
                                        }`}
                                >
                                    <div
                                        className="text-sm whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                                    />
                                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-text-secondary'
                                        }`}>
                                        {formatDistanceToNow(message.timestamp, { addSuffix: true, locale: es })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-border rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                        <span className="text-xs text-text-secondary">Escribiendo...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Preguntas rápidas (solo si no hay mensajes del usuario) */}
                    {messages.length === 1 && (
                        <div className="px-4 py-2 border-t border-border bg-white">
                            <p className="text-xs text-text-secondary mb-2">Preguntas frecuentes:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setInput(question);
                                            setTimeout(() => handleSend(), 100);
                                        }}
                                        className="text-xs px-3 py-1 bg-background hover:bg-primary/10 border border-border rounded-full transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-border bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu pregunta..."
                                className="flex-1 px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Enviar mensaje"
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

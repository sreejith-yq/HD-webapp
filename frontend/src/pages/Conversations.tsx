import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ConversationList } from '../components/conversations/ConversationList';
import { ChatInterface } from '../components/conversations/ChatInterface';
import { NewConversationModal } from '../components/conversations/NewConversationModal';

export function Conversations() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    const fetchConversations = async (params = {}) => {
        try {
            const res = await api.conversations.list(params);
            setConversations(res.data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        // Poll for updates
        const interval = setInterval(() => fetchConversations(), 15000);
        return () => clearInterval(interval);
    }, []);

    const handleSelectConversation = (conv: any) => {
        setSelectedConversation(conv);
        setShowDetails(false); // Reset details view on switch
    };

    const handleSearch = (query: string) => {
        fetchConversations({ search: query });
    };

    const handleStartNew = async (patientId: string) => {
        try {
            const res = await api.conversations.create({ patientId });
            setIsNewModalOpen(false);
            // Refresh list and select new conversation
            await fetchConversations();
            const newConv = await api.conversations.get(res.id);
            setSelectedConversation(newConv.data);
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 overflow-hidden">
            {/* List View - Hidden on mobile if chat is open */}
            <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full`}>
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversation?.id}
                    onSelect={handleSelectConversation}
                    onSearch={handleSearch}
                    onNewConversation={() => setIsNewModalOpen(true)}
                />
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
                <div className="flex-1 flex h-full relative">
                    <div className="flex-1 flex flex-col min-w-0">
                        <ChatInterface
                            conversationId={selectedConversation.id}
                            patientId={selectedConversation.patient.id}
                            patientName={selectedConversation.patient.name}
                            patientAvatar={selectedConversation.patient.avatarUrl}
                            programName={selectedConversation.program?.name}
                            onBack={() => setSelectedConversation(null)}
                            onCloseConversation={() => {
                                setSelectedConversation(null);
                                fetchConversations();
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 text-gray-400 flex-col">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium">Select a conversation to start messaging</p>
                </div>
            )}

            <NewConversationModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onStart={handleStartNew}
            />
        </div>
    );
}

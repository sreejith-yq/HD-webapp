import React, { useState } from 'react';

interface Conversation {
    id: string;
    patient: {
        name: string;
        avatarUrl: string | null;
    };
    program?: {
        name: string;
    };
    lastMessagePreview: string | null;
    lastMessageAt: string;
    unreadCount: number;
    type: 'query' | 'checkin';
}

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (conversation: Conversation) => void;
    onSearch: (query: string) => void;
    onNewConversation: () => void;
}

export function ConversationList({ conversations, selectedId, onSelect, onSearch, onNewConversation }: ConversationListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-80 lg:w-96">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                    <button
                        onClick={onNewConversation}
                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No conversations found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {conversations.map((conv) => {
                            const time = new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => onSelect(conv)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === conv.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="relative flex-shrink-0">
                                            {conv.patient.avatarUrl ? (
                                                <img src={conv.patient.avatarUrl} alt={conv.patient.name} className="w-12 h-12 rounded-xl object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                    {conv.patient.name.charAt(0)}
                                                </div>
                                            )}
                                            {conv.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {conv.patient.name}
                                                </h3>
                                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{time}</span>
                                            </div>
                                            {conv.program && (
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${conv.type === 'query' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'
                                                        }`}>
                                                        {conv.type === 'query' ? 'Query' : 'Check-in'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 truncate">{conv.program.name}</span>
                                                </div>
                                            )}
                                            <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                {conv.lastMessagePreview || 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

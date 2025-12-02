import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { PatientDetailsSidebar } from './PatientDetailsSidebar';

interface Message {
    id: string;
    sender: 'Doctor' | 'Patient';
    content: string;
    contentType: string;
    timestamp: string;
    mediaUrl?: string;
    mediaDuration?: number;
}

interface ChatInterfaceProps {
    conversationId: string;
    patientId: string;
    patientName: string;
    patientAvatar?: string | null;
    programName?: string;
    onBack: () => void;
    onCloseConversation: () => void;
}

export function ChatInterface({ conversationId, patientId, patientName, patientAvatar, programName, onBack, onCloseConversation }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'chat' | 'details'>('chat');
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);

    // Media State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
    const [isCapturingVideo, setIsCapturingVideo] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const videoChunksRef = useRef<Blob[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchMessages = async () => {
        try {
            const res = await api.conversations.getMessages(conversationId, { limit: 50 });
            setMessages(res.data);
            await api.conversations.markRead(conversationId);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        if (activeTab === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    // Cleanup streams on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [cameraStream]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempId = Date.now().toString();
        const tempMessage: Message = {
            id: tempId,
            sender: 'Doctor',
            content: newMessage,
            contentType: 'Text',
            timestamp: new Date().toISOString(),
        };

        setMessages([...messages, tempMessage]);
        setNewMessage('');

        try {
            await api.conversations.sendMessage(conversationId, { content: tempMessage.content });
            fetchMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleCloseConversation = async () => {
        try {
            await api.conversations.close(conversationId);
            setShowCloseModal(false);
            onCloseConversation();
        } catch (error) {
            console.error('Failed to close conversation:', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Video Size Check
        if (file.type.startsWith('video/') && file.size > 10 * 1024 * 1024) {
            alert('Video size must be less than 10MB.');
            return;
        }

        let fileToUpload = file;

        // Image Compression (Lazy Load)
        if (file.type.startsWith('image/')) {
            try {
                const imageCompression = (await import('browser-image-compression')).default;
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 3840, // 4K
                    useWebWorker: true,
                };
                fileToUpload = await imageCompression(file, options);
            } catch (error) {
                console.error('Image compression failed:', error);
            }
        }

        // Mock upload - in real app, upload to R2 and get URL
        const mockUrl = URL.createObjectURL(fileToUpload);
        console.log('Uploading file:', fileToUpload.name, 'Size:', fileToUpload.size);
        setShowAttachMenu(false);

        const tempId = Date.now().toString();
        const contentType = file.type.startsWith('image/') ? 'Image' : file.type.startsWith('video/') ? 'Video' : 'File';

        const tempMessage: Message = {
            id: tempId,
            sender: 'Doctor',
            content: `Sent a file: ${fileToUpload.name}`,
            contentType,
            timestamp: new Date().toISOString(),
            mediaUrl: mockUrl,
        };
        setMessages([...messages, tempMessage]);

        // Send to backend
        try {
            await api.conversations.sendMessage(conversationId, {
                content: tempMessage.content,
                contentType,
                mediaUrl: mockUrl, // Note: This URL is local-only. In prod, use real upload URL.
                mediaKey: `uploads/${fileToUpload.name}`
            });
            // Don't fetch immediately to preserve local preview until real persistence is ready
        } catch (error) {
            console.error('Failed to send media:', error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const mockUrl = URL.createObjectURL(audioBlob);

                const tempId = Date.now().toString();
                const tempMessage: Message = {
                    id: tempId,
                    sender: 'Doctor',
                    content: '',
                    contentType: 'Audio',
                    timestamp: new Date().toISOString(),
                    mediaDuration: recordingTime,
                    mediaUrl: mockUrl,
                };
                setMessages(prev => [...prev, tempMessage]);

                stream.getTracks().forEach(track => track.stop());

                // Send to backend
                try {
                    await api.conversations.sendMessage(conversationId, {
                        content: 'Audio message',
                        contentType: 'Audio',
                        mediaUrl: mockUrl,
                        mediaDuration: recordingTime
                    });
                } catch (error) {
                    console.error('Failed to send audio:', error);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Could not access microphone.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const openCamera = async () => {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 }, // 720p
                    height: { ideal: 720 },
                    frameRate: { ideal: 24 } // Lower framerate for bitrate control
                },
                audio: cameraMode === 'video'
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setCameraStream(stream);
            setShowCamera(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Failed to access camera:', error);
            alert('Could not access camera.');
        }
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
        setIsCapturingVideo(false);
    };

    const capturePhoto = async () => {
        if (!videoRef.current || !cameraStream) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) return;

            // Compress
            let fileToUpload = blob as File;
            try {
                const imageCompression = (await import('browser-image-compression')).default;
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 3840,
                    useWebWorker: true,
                };
                fileToUpload = await imageCompression(blob as File, options);
            } catch (e) {
                console.error(e);
            }

            const mockUrl = URL.createObjectURL(fileToUpload);
            const tempId = Date.now().toString();
            const tempMessage: Message = {
                id: tempId,
                sender: 'Doctor',
                content: '',
                contentType: 'Image',
                timestamp: new Date().toISOString(),
                mediaUrl: mockUrl,
            };
            setMessages(prev => [...prev, tempMessage]);
            closeCamera();

            // Send to backend
            try {
                await api.conversations.sendMessage(conversationId, {
                    content: 'Photo',
                    contentType: 'Image',
                    mediaUrl: mockUrl,
                });
            } catch (error) {
                console.error('Failed to send photo:', error);
            }
        }, 'image/jpeg', 0.8);
    };

    const startVideoCapture = () => {
        if (!cameraStream) return;
        const mediaRecorder = new MediaRecorder(cameraStream, {
            mimeType: 'video/webm;codecs=vp8', // Better compression than default usually
            videoBitsPerSecond: 1000000 // 1 Mbps
        });
        mediaRecorderRef.current = mediaRecorder;
        videoChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                videoChunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
            const mockUrl = URL.createObjectURL(videoBlob);

            const tempId = Date.now().toString();
            const tempMessage: Message = {
                id: tempId,
                sender: 'Doctor',
                content: '',
                contentType: 'Video',
                timestamp: new Date().toISOString(),
                mediaUrl: mockUrl,
            };
            setMessages(prev => [...prev, tempMessage]);
            closeCamera();

            // Send to backend
            try {
                await api.conversations.sendMessage(conversationId, {
                    content: 'Video',
                    contentType: 'Video',
                    mediaUrl: mockUrl,
                });
            } catch (error) {
                console.error('Failed to send video:', error);
            }
        };

        mediaRecorder.start();
        setIsCapturingVideo(true);
    };

    const stopVideoCapture = () => {
        if (mediaRecorderRef.current && isCapturingVideo) {
            mediaRecorderRef.current.stop();
            setIsCapturingVideo(false);
        }
    };

    const toggleCameraMode = () => {
        setCameraMode(prev => prev === 'photo' ? 'video' : 'photo');
        // Restart stream to update audio constraints if needed
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            // Re-open camera with new mode constraints
            setTimeout(openCamera, 100);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 relative">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="relative">
                        {patientAvatar ? (
                            <img src={patientAvatar} alt={patientName} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {patientName.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">{patientName}</h2>
                        {programName && <p className="text-xs text-indigo-600 font-medium">{programName}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Tabs for Mobile/Tablet (or always visible if preferred) */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Patient Info
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCloseModal(true)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close Conversation
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'chat' ? (
                    <>
                        {/* Messages */}
                        <div className="absolute inset-0 overflow-y-auto p-4 space-y-4 pb-24">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isDoctor = msg.sender === 'Doctor';
                                    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <div key={msg.id} className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isDoctor ? 'self-end items-end' : 'self-start items-start'}`}>
                                            <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${isDoctor
                                                ? 'bg-indigo-50 text-gray-800 rounded-br-sm border border-indigo-100'
                                                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                                                }`}>
                                                {msg.contentType === 'Image' && msg.mediaUrl && (
                                                    <div className="mb-2 rounded-lg overflow-hidden">
                                                        <img src={msg.mediaUrl} alt="Shared content" className="max-w-full h-auto" />
                                                    </div>
                                                )}
                                                {msg.contentType === 'Video' && msg.mediaUrl && (
                                                    <div className="mb-2 rounded-lg overflow-hidden">
                                                        <video src={msg.mediaUrl} controls className="max-w-full h-auto" />
                                                    </div>
                                                )}
                                                {msg.contentType === 'Audio' && (
                                                    <div className="flex items-center gap-3 min-w-[200px] bg-white/50 p-2 rounded-lg">
                                                        <button className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                        </button>
                                                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="w-1/3 h-full bg-indigo-600"></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{msg.mediaDuration ? `${Math.floor(msg.mediaDuration)}s` : 'Audio'}</span>
                                                    </div>
                                                )}
                                                {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">{time}</span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
                            <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto relative">
                                {/* Attach Menu */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                                        className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </button>

                                    {showAttachMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                Image / Video
                                            </button>
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                                Audio
                                            </button>
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                Document
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-colors flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 max-h-32"
                                    />
                                    <button type="button" onClick={() => openCamera()} className="p-1 text-gray-400 hover:text-gray-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>

                                {newMessage.trim() ? (
                                    <button
                                        type="submit"
                                        className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onMouseDown={startRecording}
                                        onMouseUp={stopRecording}
                                        onTouchStart={startRecording}
                                        onTouchEnd={stopRecording}
                                        className={`p-3 rounded-full transition-colors shadow-md ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </button>
                                )}
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full overflow-y-auto p-4">
                        <PatientDetailsSidebar patientId={patientId} onClose={() => setActiveTab('chat')} />
                    </div>
                )}
            </div>

            {/* Close Confirmation Modal */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl transform transition-all">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Close Conversation?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to close this conversation? It will be moved to the "Closed" tab.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCloseModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCloseConversation}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                            >
                                Close Conversation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    <div className="flex-1 relative bg-black flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-full" />
                    </div>
                    <div className="bg-black/80 p-6 flex items-center justify-between">
                        <button onClick={closeCamera} className="text-white p-4">
                            Cancel
                        </button>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex bg-gray-800 rounded-full p-1">
                                <button
                                    onClick={() => cameraMode !== 'photo' && toggleCameraMode()}
                                    className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${cameraMode === 'photo' ? 'bg-white text-black' : 'text-gray-400'}`}
                                >
                                    Photo
                                </button>
                                <button
                                    onClick={() => cameraMode !== 'video' && toggleCameraMode()}
                                    className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${cameraMode === 'video' ? 'bg-white text-black' : 'text-gray-400'}`}
                                >
                                    Video
                                </button>
                            </div>

                            {cameraMode === 'photo' ? (
                                <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors"></button>
                            ) : (
                                <button
                                    onClick={isCapturingVideo ? stopVideoCapture : startVideoCapture}
                                    className={`w-16 h-16 rounded-full border-4 border-white transition-colors flex items-center justify-center ${isCapturingVideo ? 'bg-red-600' : 'bg-red-600/80 hover:bg-red-600'}`}
                                >
                                    {isCapturingVideo && <div className="w-6 h-6 bg-white rounded-sm"></div>}
                                </button>
                            )}
                        </div>

                        <div className="w-16"></div> {/* Spacer */}
                    </div>
                </div>
            )}
        </div>
    );
}

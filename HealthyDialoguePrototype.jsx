import React, { useState } from 'react';

// Logo as base64 data URL
const LOGO_SRC = "data:image/webp;base64,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";

const SearchIcon = ({ className = "w-5 h-5", style = {} }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
  </svg>
);

const SendIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
  </svg>
);

const HeartIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
  </svg>
);

const MoreIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{color: '#5ce1e6'}}>
    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
  </svg>
);

const ChatIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
);

const ClinicIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
  </svg>
);

const ImageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);

// Squircle Avatar Component
const SquircleAvatar = ({ initials, size = 'md', light = false }) => {
  const sizes = {
    sm: 'w-11 h-11 rounded-[14px] text-sm',
    md: 'w-12 h-12 rounded-[14px] text-lg',
    lg: 'w-[52px] h-[52px] rounded-[16px] text-xl',
    xl: 'w-20 h-20 rounded-[24px] text-3xl'
  };
  
  return (
    <div 
      className={`${sizes[size]} flex items-center justify-center font-bold shrink-0`}
      style={{
        background: light ? 'rgba(92, 225, 230, 0.2)' : 'linear-gradient(135deg, #e6fafb, #d4f5f7)',
        color: light ? '#5ce1e6' : '#180f63'
      }}
    >
      {initials}
    </div>
  );
};

const conversations = [
  { id: 1, name: 'Rajesh Kumar', initials: 'RK', program: 'Cardiac Rehab Program', preview: "I've been experiencing chest pain since...", time: '10:42 AM', unread: 3, type: 'query' },
  { id: 2, name: 'Priya Mehta', initials: 'PM', program: 'Diabetes Management', preview: 'Weekly health update submitted', time: '9:15 AM', unread: 1, type: 'checkin' },
  { id: 3, name: 'Amit Singh', initials: 'AS', program: 'Post-Surgery Recovery', preview: "Thank you doctor, I'll follow up next...", time: 'Yesterday', unread: 0, type: 'query' },
  { id: 4, name: 'Sunita Gupta', initials: 'SG', program: 'Weight Management', preview: 'Great progress this week! Keep it up...', time: 'Yesterday', unread: 0, type: 'checkin' },
  { id: 5, name: 'Vikram Reddy', initials: 'VR', program: 'Hypertension Control', preview: '🎤 Voice message (0:32)', time: '25/11/2025', unread: 2, type: 'query' },
];

const messages = [
  { id: 1, sender: 'patient', content: "Good morning Doctor. I've been experiencing some chest pain since yesterday evening.", time: '9:30 AM' },
  { id: 2, sender: 'patient', content: "Here's a photo of where it hurts", time: '9:31 AM', hasImage: true },
  { id: 3, sender: 'doctor', content: "Good morning Rajesh. Thank you for reaching out. Let me ask a few questions.", time: '9:45 AM' },
  { id: 4, sender: 'doctor', content: 'Is the pain constant or does it come and go?', time: '9:46 AM' },
  { id: 5, sender: 'patient', content: 'It comes and goes Doctor. Gets a bit worse when I climb stairs.', time: '10:15 AM' },
  { id: 6, sender: 'patient', content: '', time: '10:42 AM', hasAudio: true },
];

const patients = [
  { id: 1, name: 'Rajesh Kumar', initials: 'RK', program: 'Cardiac Rehab Program' },
  { id: 2, name: 'Priya Mehta', initials: 'PM', program: 'Diabetes Management' },
  { id: 3, name: 'Amit Singh', initials: 'AS', program: 'Post-Surgery Recovery' },
  { id: 4, name: 'Sunita Gupta', initials: 'SG', program: 'Weight Management' },
  { id: 5, name: 'Vikram Reddy', initials: 'VR', program: 'Hypertension Control' },
  { id: 6, name: 'Neha Patel', initials: 'NP', program: 'Prenatal Care' },
];

export default function HealthyDialogueDashboard() {
  const [screen, setScreen] = useState('list');
  const [mainTab, setMainTab] = useState('conversations');
  const [chatTab, setChatTab] = useState('conversation');
  const [selectedConversation, setSelectedConversation] = useState(null);

  const primary = '#5ce1e6';
  const highlight = '#180f63';

  const openConversation = (conv) => {
    setSelectedConversation(conv);
    setChatTab('conversation');
    setScreen(conv.type === 'checkin' ? 'checkin' : 'chat');
  };

  const switchMainTab = (tab) => {
    setMainTab(tab);
    setScreen(tab === 'conversations' ? 'list' : 'clinic');
  };

  // Bottom Navigation Component
  const BottomNav = () => (
    <nav className="flex bg-white border-t border-gray-200 py-2">
      <button 
        onClick={() => switchMainTab('conversations')}
        className={`flex-1 flex flex-col items-center gap-1 py-2 ${mainTab === 'conversations' ? 'text-[#180f63]' : 'text-gray-400'}`}
      >
        <div className="relative">
          <ChatIcon />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">8</span>
        </div>
        <span className="text-[11px] font-semibold">Conversations</span>
      </button>
      <button 
        onClick={() => switchMainTab('clinic')}
        className={`flex-1 flex flex-col items-center gap-1 py-2 ${mainTab === 'clinic' ? 'text-[#180f63]' : 'text-gray-400'}`}
      >
        <ClinicIcon />
        <span className="text-[11px] font-semibold">Clinic</span>
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: `linear-gradient(135deg, ${highlight} 0%, #2a1f8a 100%)`}}>
      <div className="w-[375px] h-[750px] bg-gray-100 rounded-[40px] overflow-hidden shadow-2xl relative border-8 border-gray-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-800 rounded-b-2xl z-50" />

        {/* Conversations List Screen */}
        {screen === 'list' && (
          <div className="h-full flex flex-col">
            <header className="pt-11 pb-4 px-4" style={{backgroundColor: highlight}}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold" style={{color: primary}}>Healthy Dialogue</h1>
                  <p className="text-sm text-white opacity-90">Patient Inbox</p>
                </div>
                <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: `${primary}20`, color: primary}}>
                  <MoreIcon />
                </button>
              </div>
              <div className="flex items-center gap-2.5 rounded-full px-4 py-2.5" style={{backgroundColor: 'rgba(255,255,255,0.12)', border: `1px solid ${primary}33`}}>
                <SearchIcon className="w-4 h-4" style={{color: primary, opacity: 0.8}} />
                <input type="text" placeholder="Search patients or messages..." className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/50" />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto py-2">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className="mx-3 mb-2 p-3 bg-white rounded-xl cursor-pointer transition-all hover:shadow-md border border-gray-200"
                  style={{ borderLeft: conv.unread > 0 ? `3px solid ${highlight}` : undefined }}
                >
                  <div className="flex gap-3">
                    <SquircleAvatar initials={conv.initials} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${conv.unread > 0 ? 'font-semibold' : 'font-medium'} text-gray-800`}>{conv.name}</span>
                        <span className="text-xs" style={{ color: conv.unread > 0 ? highlight : '#9CA3AF', fontWeight: conv.unread > 0 ? 600 : 400 }}>{conv.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium mb-1" style={{color: highlight}}>
                        <HeartIcon />{conv.program}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase" style={{ backgroundColor: conv.type === 'query' ? '#EEF2FF' : '#e6fafb', color: conv.type === 'query' ? highlight : '#0891b2' }}>
                          {conv.type === 'query' ? 'Query' : 'Check-In'}
                        </span>
                        <span className={`text-xs truncate ${conv.unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>{conv.preview}</span>
                        {conv.unread > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center text-white" style={{backgroundColor: highlight}}>{conv.unread}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setScreen('new')}
              className="absolute bottom-20 right-5 w-14 h-14 rounded-full shadow-lg flex items-center justify-center overflow-hidden transition-transform hover:scale-110"
            >
              <img src={LOGO_SRC} alt="New Conversation" className="w-full h-full object-cover" />
            </button>

            <BottomNav />
          </div>
        )}

        {/* Clinic Dashboard Screen */}
        {screen === 'clinic' && (
          <div className="h-full flex flex-col">
            <header className="pt-11 pb-4 px-4" style={{backgroundColor: highlight}}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold" style={{color: primary}}>Healthy Dialogue</h1>
                  <p className="text-sm text-white opacity-90">Clinic Dashboard</p>
                </div>
                <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: `${primary}20`, color: primary}}>
                  <MoreIcon />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[{value: '24', label: 'Active Patients'}, {value: '8', label: 'Pending Queries'}, {value: '12', label: 'Check-ins Today'}, {value: '3', label: 'Appointments'}].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                    <div className="text-2xl font-bold" style={{color: highlight}}>{stat.value}</div>
                    <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
                <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{color: highlight}}>Today's Schedule</div>
                {[{name: 'Rajesh Kumar', time: '10:30 AM - Follow-up'}, {name: 'Priya Mehta', time: '2:00 PM - Consultation'}, {name: 'Amit Singh', time: '4:30 PM - Check-up'}].map((apt, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2 last:mb-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: '#e6fafb', color: highlight}}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{apt.name}</div>
                      <div className="text-xs text-gray-500">{apt.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BottomNav />
          </div>
        )}

        {/* Chat Screen */}
        {screen === 'chat' && (
          <div className="h-full flex flex-col">
            <header className="pt-11 pb-3 px-3 flex items-center gap-3" style={{backgroundColor: highlight}}>
              <button onClick={() => { setScreen('list'); setMainTab('conversations'); }} className="w-9 h-9 rounded-full flex items-center justify-center" style={{backgroundColor: `${primary}20`, color: primary}}>
                <BackIcon />
              </button>
              <SquircleAvatar initials={selectedConversation?.initials || 'RK'} size="sm" light />
              <div className="flex-1">
                <div className="text-white font-semibold">{selectedConversation?.name || 'Rajesh Kumar'}</div>
                <div className="text-xs" style={{color: primary}}>{selectedConversation?.program || 'Cardiac Rehab Program'}</div>
              </div>
            </header>

            {/* Chat Tabs */}
            <div className="flex bg-white border-b border-gray-200">
              {['conversation', 'details'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setChatTab(tab)}
                  className={`flex-1 py-3 text-sm font-semibold relative ${chatTab === tab ? 'text-[#180f63]' : 'text-gray-400'}`}
                >
                  {tab === 'conversation' ? 'Conversation' : 'Patient Details'}
                  {chatTab === tab && <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-t" style={{backgroundColor: highlight}} />}
                </button>
              ))}
            </div>

            {/* Conversation Tab */}
            {chatTab === 'conversation' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex flex-col gap-2">
                  <div className="flex justify-center my-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: `${highlight}15`, color: highlight}}>Today</span>
                  </div>
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'doctor' ? 'self-end' : 'self-start'}`}>
                      <div className="px-3 py-2 rounded-2xl text-sm" style={{
                        backgroundColor: msg.sender === 'doctor' ? '#e6fafb' : 'white',
                        borderBottomRightRadius: msg.sender === 'doctor' ? '4px' : undefined,
                        borderBottomLeftRadius: msg.sender === 'patient' ? '4px' : undefined,
                        border: msg.sender === 'doctor' ? `1px solid ${primary}40` : undefined
                      }}>
                        {msg.hasImage && <div className="w-44 h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-400"><ImageIcon /></div>}
                        {msg.hasAudio && (
                          <div className="flex items-center gap-2 p-2 rounded-lg min-w-[160px]" style={{backgroundColor: `${primary}15`}}>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{backgroundColor: highlight}}><PlayIcon /></button>
                            <div className="flex-1 flex items-center gap-0.5 h-6">
                              {[8,16,12,20,14,18,10,22,16,12].map((h, i) => <div key={i} className="w-1 rounded-full" style={{height: h, backgroundColor: highlight, opacity: 0.5}} />)}
                            </div>
                            <span className="text-xs text-gray-500">0:32</span>
                          </div>
                        )}
                        {msg.content && <span>{msg.content}</span>}
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] text-gray-400 mt-1 ${msg.sender === 'doctor' ? 'justify-end' : ''}`}>
                        {msg.time}
                        {msg.sender === 'doctor' && <CheckIcon />}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-white border-t flex items-end gap-2">
                  <div className="flex-1 flex items-end bg-gray-100 rounded-3xl px-4 py-1 border border-gray-200">
                    <input type="text" placeholder="Type a message..." className="flex-1 py-2 bg-transparent outline-none text-sm" />
                  </div>
                  <button className="w-11 h-11 rounded-full flex items-center justify-center" style={{backgroundColor: highlight, color: primary}}>
                    <SendIcon />
                  </button>
                </div>
              </>
            )}

            {/* Patient Details Tab */}
            {chatTab === 'details' && (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="bg-white rounded-xl p-5 text-center mb-4 shadow-sm border border-gray-200">
                  <div className="mx-auto mb-3"><SquircleAvatar initials={selectedConversation?.initials || 'RK'} size="xl" /></div>
                  <div className="text-xl font-bold text-gray-800">{selectedConversation?.name || 'Rajesh Kumar'}</div>
                  <div className="text-sm font-medium" style={{color: highlight}}>{selectedConversation?.program || 'Cardiac Rehab Program'}</div>
                </div>

                {/* Vitals */}
                <div className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200">
                  <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{color: highlight}}>Latest Vitals</div>
                  {[{label: 'Blood Pressure', value: '130/85 mmHg'}, {label: 'Heart Rate', value: '78 bpm'}, {label: 'Weight', value: '82 kg'}].map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-800">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Your Programs with Patient */}
                <div className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200">
                  <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{color: highlight}}>Your Programs with Patient</div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: '#e6fafb', color: highlight}}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-800">Cardiac Rehab Program</div>
                      <div className="text-xs text-gray-500">Started 15 Oct 2025 • Active</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 uppercase">Active</span>
                  </div>
                  
                  {/* Other Programs Indicator */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-3 border border-dashed border-gray-300">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500 font-medium">2 other active programs</span>
                        <span className="text-xs text-gray-500 font-medium">3 completed programs</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">Requires Approval</span>
                  </div>
                </div>

                {/* Your Prescriptions */}
                <div className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold uppercase tracking-wide" style={{color: highlight}}>Your Prescriptions</div>
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{backgroundColor: '#e6fafb', color: primary}}>View All</button>
                  </div>
                  {[{name: 'Cardiac Care Prescription', date: 'Dr. Ananya Sharma • 20 Nov 2025'}, {name: 'Follow-up Medication', date: 'Dr. Ananya Sharma • 1 Nov 2025'}].map((rx, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2 last:mb-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50" style={{color: highlight}}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">{rx.name}</div>
                        <div className="text-xs text-gray-500">{rx.date}</div>
                      </div>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: '#e6fafb', color: highlight}}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  {/* Other Prescriptions Indicator */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-3 border border-dashed border-gray-300">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">4 prescriptions from other doctors</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">Requires Approval</span>
                  </div>
                </div>

                {/* Shared Lab Reports */}
                <div className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold uppercase tracking-wide" style={{color: highlight}}>Shared Lab Reports</div>
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{backgroundColor: '#e6fafb', color: primary}}>View All</button>
                  </div>
                  {[{name: 'Lipid Profile', date: 'Shared for Cardiac Rehab • 15 Nov 2025'}, {name: 'ECG Report', date: 'Shared for Cardiac Rehab • 10 Nov 2025'}].map((lab, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2 last:mb-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">{lab.name}</div>
                        <div className="text-xs text-gray-500">{lab.date}</div>
                      </div>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: '#e6fafb', color: highlight}}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2" style={{backgroundColor: highlight, color: primary}}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Request Full Medical History
                </button>
              </div>
            )}
          </div>
        )}

        {/* New Conversation Screen */}
        {screen === 'new' && (
          <div className="h-full flex flex-col">
            <header className="pt-11 pb-3 px-3 flex items-center gap-3" style={{backgroundColor: highlight}}>
              <button onClick={() => setScreen('list')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{backgroundColor: `${primary}20`, color: primary}}>
                <BackIcon />
              </button>
              <div className="flex-1 ml-2">
                <div className="text-white font-semibold">New Conversation</div>
                <div className="text-xs" style={{color: primary}}>Select a patient</div>
              </div>
            </header>

            <div className="p-4 bg-white border-b">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
                <SearchIcon className="w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search patients..." className="flex-1 bg-transparent outline-none text-sm" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {patients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => { setSelectedConversation(patient); setChatTab('conversation'); setScreen('chat'); }}
                  className="flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-cyan-50"
                >
                  <SquircleAvatar initials={patient.initials} size="md" />
                  <div>
                    <div className="font-semibold text-gray-800">{patient.name}</div>
                    <div className="text-sm text-gray-500">{patient.program}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

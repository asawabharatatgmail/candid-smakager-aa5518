import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';

interface MailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  folder: 'inbox' | 'sent' | 'draft';
  label?: string;
}

const SEED_INBOX: MailMessage[] = [
  { id: 'm1', from: 'rahul.verma@gmail.com', to: 'admin@system4learn.com', subject: 'Admission Enquiry — Class 10', body: 'Dear Admin, I am interested in enrolling my son in Class 10. Could you please share the fee structure and admission process?', date: new Date(Date.now() - 3600000).toISOString(), read: false, folder: 'inbox', label: 'Enquiry' },
  { id: 'm2', from: 'priya.sharma@gmail.com', to: 'admin@system4learn.com', subject: 'Fee Payment Confirmation', body: 'I have made the fee payment for Q2 2024. Please confirm receipt. Transaction ID: TXN2024001234', date: new Date(Date.now() - 7200000).toISOString(), read: false, folder: 'inbox', label: 'Finance' },
  { id: 'm3', from: 'amit.kumar@gmail.com', to: 'admin@system4learn.com', subject: 'Request for TC — Ananya Kumar', body: 'We are relocating to Mumbai and need a Transfer Certificate for our daughter Ananya Kumar (Roll No: 2024-047). Please process at your earliest.', date: new Date(Date.now() - 86400000).toISOString(), read: true, folder: 'inbox', label: 'Documents' },
  { id: 'm4', from: 'teacher.ramesh@system4learn.com', to: 'admin@system4learn.com', subject: 'Leave Application — 15th & 16th July', body: 'Respected Admin, I am requesting leave on 15th and 16th July 2024 due to a family function. Please approve.', date: new Date(Date.now() - 172800000).toISOString(), read: true, folder: 'inbox', label: 'Staff' },
  { id: 'm5', from: 'sunita.patel@gmail.com', to: 'admin@system4learn.com', subject: 'Parent-Teacher Meeting Request', body: 'I would like to schedule a meeting with my son Arjun\'s class teacher to discuss his performance. Please let me know your availability.', date: new Date(Date.now() - 259200000).toISOString(), read: true, folder: 'inbox', label: 'Enquiry' },
  { id: 'm6', from: 'admissions@system4learn.com', to: 'new.leads@gmail.com', subject: 'Welcome to System4Learn!', body: 'Dear Parent, Thank you for your interest. We are delighted to share details about our programs...', date: new Date(Date.now() - 345600000).toISOString(), read: true, folder: 'sent' },
];

const EMAIL_TEMPLATES = [
  { id: 'welcome', name: 'Welcome New Student', subject: 'Welcome to System4Learn — Important Information', body: `Dear {name},\n\nWe are delighted to welcome you to System4Learn!\n\nYour login credentials:\nUsername: {email}\nPassword: {password}\n\nPlease login at: https://system4learn.com\n\nFor any assistance, contact us at admin@system4learn.com\n\nWarm regards,\nSystem4Learn Team` },
  { id: 'fee_reminder', name: 'Fee Payment Reminder', subject: 'Friendly Reminder: Fee Payment Due', body: `Dear {name},\n\nThis is a reminder that your fee payment of ₹{amount} is due on {due_date}.\n\nPlease login to your portal to make the payment: https://system4learn.com\n\nIf you have already made the payment, please ignore this message.\n\nRegards,\nAccounts Department\nSystem4Learn` },
  { id: 'exam_notice', name: 'Exam Schedule Notice', subject: 'Important: Upcoming Examination Schedule', body: `Dear {name},\n\nThis is to inform you that the {exam_name} is scheduled to begin on {start_date}.\n\nPlease ensure you:\n• Bring your hall ticket\n• Report 30 minutes before the exam\n• Carry all required stationery\n\nBest of luck!\n\nSystem4Learn Academic Team` },
  { id: 'event_invite', name: 'Event Invitation', subject: 'You are Invited — {event_name}', body: `Dear {name},\n\nWe cordially invite you to {event_name} scheduled on {date} at {time}.\n\nVenue: {venue}\n\nPlease confirm your attendance by replying to this email.\n\nWarm regards,\nSystem4Learn` },
  { id: 'result', name: 'Exam Results Published', subject: 'Your Exam Results are Available', body: `Dear {name},\n\nYour results for {exam_name} have been published.\n\nLogin to view your detailed result report: https://system4learn.com\n\nFor any queries, contact your class teacher.\n\nRegards,\nSystem4Learn Academic Team` },
];

const LABEL_COLORS: Record<string, string> = {
  Enquiry: 'bg-blue-100 text-blue-700',
  Finance: 'bg-emerald-100 text-emerald-700',
  Documents: 'bg-amber-100 text-amber-700',
  Staff: 'bg-violet-100 text-violet-700',
};

const MailView: React.FC = () => {
  const { currentUser, openConnectEmailModal, students, teachers } = useAppContext();
  const isConnected = !!currentUser?.connectedEmail;

  const [messages, setMessages] = useState<MailMessage[]>(SEED_INBOX);
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'draft' | 'bulk'>('inbox');
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES[0]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBody, setBulkBody] = useState('');
  const [bulkSent, setBulkSent] = useState(false);
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' });

  const allEmails = useMemo(() => {
    const s = students.map(st => ({ id: st.id, name: st.name, email: st.email, type: 'Student' }));
    const t = teachers.map(te => ({ id: te.id, name: te.name, email: te.email, type: 'Teacher' }));
    return [...s, ...t];
  }, [students, teachers]);

  const filtered = messages
    .filter(m => m.folder === (folder === 'bulk' ? 'sent' : folder))
    .filter(m => !search || m.subject.toLowerCase().includes(search.toLowerCase()) || m.from.toLowerCase().includes(search.toLowerCase()));

  const unreadCount = messages.filter(m => !m.read && m.folder === 'inbox').length;

  const markRead = (id: string) => setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  const deleteMessage = (id: string) => { setMessages(prev => prev.filter(m => m.id !== id)); if (selected === id) setSelected(null); };

  const handleSend = () => {
    if (!compose.to || !compose.subject) return;
    const sent: MailMessage = {
      id: `m${Date.now()}`,
      from: currentUser?.email || 'admin@system4learn.com',
      to: compose.to,
      subject: compose.subject,
      body: compose.body,
      date: new Date().toISOString(),
      read: true,
      folder: 'sent',
    };
    setMessages(prev => [sent, ...prev]);
    setCompose({ to: '', subject: '', body: '' });
    setShowCompose(false);
  };

  const handleBulkSend = () => {
    if (!bulkSubject || selectedRecipients.length === 0) return;
    const bulkMessages: MailMessage[] = selectedRecipients.map((id, i) => {
      const rec = allEmails.find(e => e.id === id);
      return {
        id: `bulk_${Date.now()}_${i}`,
        from: currentUser?.email || 'admin@system4learn.com',
        to: rec?.email || '',
        subject: bulkSubject.replace('{name}', rec?.name || 'Student'),
        body: bulkBody.replace(/{name}/g, rec?.name || 'Student'),
        date: new Date().toISOString(),
        read: true,
        folder: 'sent' as const,
        label: 'Bulk',
      };
    });
    setMessages(prev => [...bulkMessages, ...prev]);
    setBulkSent(true);
    setTimeout(() => { setBulkSent(false); setShowBulk(false); setSelectedRecipients([]); setBulkSubject(''); setBulkBody(''); }, 2500);
  };

  const toggleRecipient = (id: string) => setSelectedRecipients(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  const selectAll = () => setSelectedRecipients(allEmails.map(e => e.id));
  const clearAll = () => setSelectedRecipients([]);

  const selectedMsg = messages.find(m => m.id === selected);

  const FOLDERS = [
    { key: 'inbox', label: 'Inbox', icon: 'ri-inbox-line', count: unreadCount },
    { key: 'sent', label: 'Sent', icon: 'ri-send-plane-2-line', count: 0 },
    { key: 'bulk', label: 'Bulk Sent', icon: 'ri-mail-send-line', count: 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow-md">
            <i className="ri-mail-line text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Mail Center</h1>
            <p className="text-sm text-slate-500">Gmail sync · Bulk mailing · Templates · CRM outreach</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowBulk(true); setShowCompose(false); }} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
            <i className="ri-mail-send-line" /> Bulk Mail
          </button>
          <button onClick={() => { setShowCompose(true); setShowBulk(false); }} className="btn-primary">
            <i className="ri-edit-2-line" /> Compose
          </button>
        </div>
      </div>

      {/* Gmail Connect Banner */}
      {!isConnected && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-google-fill text-2xl text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Connect Your Gmail Account</p>
              <p className="text-xs text-slate-500">Sync your inbox, send from your Gmail address, and manage all communications in one place.</p>
            </div>
          </div>
          <button onClick={openConnectEmailModal} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm flex-shrink-0">
            <i className="ri-google-fill" /> Connect Gmail
          </button>
        </div>
      )}

      {isConnected && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
          <i className="ri-checkbox-circle-fill text-emerald-500 text-xl" />
          <p className="text-sm font-semibold text-emerald-800">
            Connected: <span className="font-bold">{currentUser?.connectedEmail}</span>
            <span className="text-emerald-600 font-normal ml-2">· Inbox synced · All mails loaded</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ minHeight: '70vh' }}>
        {/* Sidebar */}
        <div className="space-y-2">
          {FOLDERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFolder(f.key as any); setSelected(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${folder === f.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700'}`}
            >
              <span className="flex items-center gap-2.5"><i className={f.icon} /> {f.label}</span>
              {f.count > 0 && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${folder === f.key ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-700'}`}>{f.count}</span>}
            </button>
          ))}

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">Labels</p>
            {Object.entries(LABEL_COLORS).map(([label, cls]) => (
              <button key={label} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Stats</p>
            {[
              { label: 'Total Emails', value: messages.length },
              { label: 'Unread', value: unreadCount },
              { label: 'Sent', value: messages.filter(m => m.folder === 'sent').length },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between px-1 text-xs text-slate-600">
                <span>{s.label}</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mail List + Reading Pane */}
        <div className="lg:col-span-3 flex flex-col gap-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Search bar */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search emails…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden" style={{ minHeight: '55vh' }}>
            {/* Mail list */}
            <div className={`${selectedMsg ? 'hidden sm:flex' : 'flex'} flex-col border-r border-slate-100 overflow-y-auto`} style={{ width: selectedMsg ? '38%' : '100%', minWidth: selectedMsg ? '220px' : 'auto' }}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4 flex-1">
                  <i className="ri-inbox-line text-4xl text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No emails in {folder}</p>
                </div>
              ) : (
                filtered.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => { setSelected(msg.id); markRead(msg.id); }}
                    className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-colors ${selected === msg.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm truncate flex-1 ${!msg.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {msg.folder === 'inbox' ? msg.from.split('@')[0] : msg.to}
                      </p>
                      <p className="text-xs text-slate-400 flex-shrink-0">{format(new Date(msg.date), 'dd MMM')}</p>
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${!msg.read ? 'font-semibold text-blue-700' : 'text-slate-500'}`}>{msg.subject}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{msg.body.substring(0, 60)}…</p>
                    {msg.label && <span className={`mt-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_COLORS[msg.label] || 'bg-slate-100 text-slate-600'}`}>{msg.label}</span>}
                  </button>
                ))
              )}
            </div>

            {/* Reading pane */}
            {selectedMsg && (
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex items-start justify-between mb-4">
                  <button onClick={() => setSelected(null)} className="sm:hidden text-blue-600 text-sm font-medium flex items-center gap-1 mb-2">
                    <i className="ri-arrow-left-line" /> Back
                  </button>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">{selectedMsg.subject}</h2>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {selectedMsg.from[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{selectedMsg.from}</p>
                    <p className="text-xs text-slate-500">To: {selectedMsg.to} · {format(new Date(selectedMsg.date), 'dd MMM yyyy, h:mm a')}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => setCompose(c => ({ ...c, to: selectedMsg.from, subject: `Re: ${selectedMsg.subject}` }))}
                      className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="ri-reply-line mr-1" />Reply
                    </button>
                    <button onClick={() => deleteMessage(selectedMsg.id)} className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                      <i className="ri-delete-bin-line" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line border border-slate-100">
                  {selectedMsg.body}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">New Email</h2>
                <p className="modal-subtitle">From: {currentUser?.connectedEmail || currentUser?.email}</p>
              </div>
              <button onClick={() => setShowCompose(false)} className="btn-icon"><i className="ri-close-line text-xl" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">To *</label>
                <input type="email" value={compose.to} onChange={e => setCompose(c => ({ ...c, to: e.target.value }))} className="input-field" placeholder="recipient@email.com" />
              </div>
              <div>
                <label className="form-label">Subject *</label>
                <input type="text" value={compose.subject} onChange={e => setCompose(c => ({ ...c, subject: e.target.value }))} className="input-field" placeholder="Email subject" />
              </div>
              <div>
                <label className="form-label">Message</label>
                <textarea value={compose.body} onChange={e => setCompose(c => ({ ...c, body: e.target.value }))} className="input-field" style={{ height: '180px', paddingTop: '12px' }} placeholder="Write your message here…" />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCompose(false)} className="btn-cancel">Discard</button>
              <a href={`mailto:${compose.to}?subject=${encodeURIComponent(compose.subject)}&body=${encodeURIComponent(compose.body)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 no-underline px-4">
                <i className="ri-mail-open-line" /> Open in Gmail
              </a>
              <button onClick={handleSend} disabled={!compose.to || !compose.subject} className="btn-primary disabled:opacity-50">
                <i className="ri-send-plane-2-line" /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Mail Modal */}
      {showBulk && (
        <div className="modal-overlay" onClick={() => setShowBulk(false)}>
          <div className="modal-box" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Bulk Email Campaign</h2>
                <p className="modal-subtitle">Send personalised emails to multiple recipients at once</p>
              </div>
              <button onClick={() => setShowBulk(false)} className="btn-icon"><i className="ri-close-line text-xl" /></button>
            </div>

            {bulkSent ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <i className="ri-checkbox-circle-fill text-emerald-500 text-3xl" />
                </div>
                <p className="text-xl font-bold text-slate-900">Emails Sent Successfully!</p>
                <p className="text-slate-500 mt-1">{selectedRecipients.length} emails dispatched</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
                {/* Left: Recipient selection */}
                <div className="sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Select Recipients</p>
                    <div className="flex gap-2">
                      <button onClick={selectAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">All</button>
                      <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-700 font-medium">Clear</button>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {allEmails.map(rec => (
                        <label key={rec.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                          <input type="checkbox" checked={selectedRecipients.includes(rec.id)} onChange={() => toggleRecipient(rec.id)} className="rounded border-slate-300 text-blue-600" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{rec.name}</p>
                            <p className="text-xs text-slate-400 truncate">{rec.email}</p>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${rec.type === 'Student' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>{rec.type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center">{selectedRecipients.length} of {allEmails.length} selected</p>
                </div>

                {/* Right: Compose */}
                <div className="sm:col-span-3 space-y-3">
                  <div>
                    <label className="form-label">Email Template</label>
                    <select
                      value={selectedTemplate.id}
                      onChange={e => {
                        const t = EMAIL_TEMPLATES.find(tp => tp.id === e.target.value)!;
                        setSelectedTemplate(t);
                        setBulkSubject(t.subject);
                        setBulkBody(t.body);
                      }}
                      className="input-field"
                    >
                      {EMAIL_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Subject *</label>
                    <input type="text" value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} className="input-field" placeholder="Email subject" />
                  </div>
                  <div>
                    <label className="form-label">
                      Message Body
                      <span className="ml-2 text-xs font-normal text-blue-500">Use {'{name}'} for personalisation</span>
                    </label>
                    <textarea
                      value={bulkBody}
                      onChange={e => setBulkBody(e.target.value)}
                      className="input-field"
                      style={{ height: '160px', paddingTop: '12px' }}
                      placeholder="Write your email here…"
                    />
                  </div>
                </div>
              </div>
            )}

            {!bulkSent && (
              <div className="modal-footer">
                <button onClick={() => setShowBulk(false)} className="btn-cancel">Cancel</button>
                <button
                  onClick={handleBulkSend}
                  disabled={selectedRecipients.length === 0 || !bulkSubject}
                  className="btn-primary disabled:opacity-50"
                >
                  <i className="ri-mail-send-line" />
                  Send to {selectedRecipients.length} Recipient{selectedRecipients.length !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MailView;

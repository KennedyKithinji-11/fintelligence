import { useState, useRef } from 'react';
import client from '../api/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export function AIResearchPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await client.post('/research/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus(`✓ ${data.source} ingested (${data.chunks} chunks)`);
    } catch (err: any) {
      setUploadStatus(`✗ Upload failed: ${err?.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);
    try {
      const { data } = await client.post('/research/query', { question });
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err?.response?.data?.detail || 'Query failed'}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e] border-b border-[#2a3560] p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
          AI Research
        </span>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-xs bg-[#1e2847] border border-[#2a3560] text-[#7a83a6] px-2 py-1 rounded hover:border-[#00d4ff] hover:text-white transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : '+ Upload PDF'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Upload status */}
      {uploadStatus && (
        <div className={`text-xs mb-2 px-2 py-1 rounded ${
          uploadStatus.startsWith('✓')
            ? 'bg-green-500/10 text-green-400'
            : 'bg-red-500/10 text-red-400'
        }`}>
          {uploadStatus}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-[#4a5270] text-xs text-center mt-4">
            Upload a PDF then ask questions about it
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`text-xs rounded p-2 ${
            msg.role === 'user'
              ? 'bg-[#1e2847] text-white ml-4'
              : 'bg-[#0f1629] border border-[#2a3560] text-[#e8eaf2]'
          }`}>
            {msg.role === 'assistant' && (
              <div className="text-[#00d4ff] font-mono mb-1">FinTelligence AI</div>
            )}
            <div className="whitespace-pre-wrap">{msg.content}</div>
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-1 text-[#4a5270]">
                Sources: {msg.sources.join(', ')}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-[#4a5270] animate-pulse">
            Analyzing documents...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-1">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleQuery()}
          placeholder="Ask about uploaded documents..."
          className="flex-1 bg-[#050810] border border-[#2a3560] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#00d4ff] placeholder-[#4a5270]"
        />
        <button
          onClick={handleQuery}
          disabled={loading || !question.trim()}
          className="bg-[#00d4ff] text-[#050810] text-xs font-bold px-3 py-1.5 rounded hover:bg-[#00b8e0] transition-colors disabled:opacity-50"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
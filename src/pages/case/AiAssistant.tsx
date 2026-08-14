import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello Investigator. I am analyzing the data for CASE-2026-001. I have access to all 10 evidence items, 8 entities, and the chronological timeline. How can I assist you?' },
    { role: 'user', text: 'What evidence contradicts Hypothesis 1?' },
    { role: 'assistant', text: 'Hypothesis H-01 suggests Dr. Chen willfully stole the data. However, Evidence E-003 (Interview with James Smith) contradicts this. Smith states that Dr. Chen left his keycard on his desk on Aug 8, which makes it unlikely he used it to access the server room at 01:15 AM on Aug 9.' }
  ]);
  const [input, setInput] = useState('');

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">AI Assistant</h1>
        <p className="text-sm text-text-muted">Case-aware investigation copilot powered by Evidentia AI.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-surface-hover border border-border' : 'bg-primary/20 border border-primary/30'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-text-muted" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-surface-hover text-white rounded-tr-sm' : 'glass-panel text-text border border-border/50 rounded-tl-sm'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.role === 'assistant' && i === messages.length - 1 && (
                  <div className="mt-3 flex gap-2">
                    <span className="text-[10px] uppercase font-bold text-primary/70 flex items-center gap-1 border border-primary/20 px-2 py-0.5 rounded-full bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                      <Sparkles className="w-3 h-3" /> View Evidence E-003
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-border bg-surface/50">
          <div className="flex gap-2 mb-3">
            {['Summarize case', 'Show contradictions', 'Next steps?'].map(suggest => (
              <button key={suggest} className="px-3 py-1.5 rounded-full text-xs bg-surface border border-border text-text-muted hover:text-white hover:border-primary/50 transition-colors">
                {suggest}
              </button>
            ))}
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this case..." 
              className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
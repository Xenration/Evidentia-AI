import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Mic, PlayCircle, FileText, Clock } from 'lucide-react';

export function Interviews() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Interviews & Transcripts</h1>
          <p className="text-sm text-text-muted">Analyze audio/video interviews and extract statements.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2">
          <Mic className="w-4 h-4" /> Upload Interview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Available Recordings</div>
          
          <Card className="border-primary/50 bg-primary/5 cursor-pointer">
            <CardContent className="p-4 flex gap-3">
              <div className="mt-1 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white">James Smith Interview</h3>
                <p className="text-xs text-text-muted">ID: E-003 • Aug 11, 2026</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] uppercase bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">Transcribed</span>
                  <span className="text-[10px] uppercase bg-surface border border-border text-text-muted px-2 py-0.5 rounded">45:22 mins</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="bg-surface-hover/50">
              <div className="flex justify-between items-center w-full">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-primary" /> Player & Transcript
                </CardTitle>
                <button className="text-xs font-semibold text-text-muted hover:text-white flex items-center gap-1 bg-surface px-3 py-1.5 border border-border rounded-lg">
                  <FileText className="w-3.5 h-3.5" /> Export PDF
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col">
              {/* Fake Audio Player */}
              <div className="p-4 bg-surface border-b border-border flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 hover:bg-primary-hover">
                  <PlayCircle className="w-6 h-6" />
                </button>
                <div className="flex-1 space-y-2">
                  <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3" />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted font-mono">
                    <span>14:05</span>
                    <span>45:22</span>
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[500px]">
                <div className="flex gap-4">
                  <div className="w-10 text-xs text-text-muted font-mono pt-1 text-right">14:05</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Investigator (A. Vance)</div>
                    <p className="text-sm text-text-muted">When did you last see Dr. Chen's keycard?</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 text-xs text-text-muted font-mono pt-1 text-right">14:12</div>
                  <div className="flex-1 bg-surface-hover/50 p-3 rounded-lg border border-border/50 relative group">
                    <div className="text-xs font-bold text-purple-400 mb-1 uppercase tracking-wider flex justify-between">
                      James Smith
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded cursor-pointer">Tag as Contradiction</span>
                    </div>
                    <p className="text-sm text-white">He left it on his desk on August 8th. I remember clearly because he told me he wouldn't need it for the weekend.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 text-xs text-text-muted font-mono pt-1 text-right">14:28</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Investigator (A. Vance)</div>
                    <p className="text-sm text-text-muted">Are you absolutely certain? The logs show it was used at 1:15 AM on August 9th to access Server Room B.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 text-xs text-text-muted font-mono pt-1 text-right">14:35</div>
                  <div className="flex-1 bg-surface-hover/50 p-3 rounded-lg border border-border/50">
                    <div className="text-xs font-bold text-purple-400 mb-1 uppercase tracking-wider">James Smith</div>
                    <p className="text-sm text-white">That's impossible. Unless someone else took it from his desk after hours.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
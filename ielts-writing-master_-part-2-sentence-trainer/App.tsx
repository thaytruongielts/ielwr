
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Send, 
  RotateCcw, 
  ChevronRight, 
  History as HistoryIcon, 
  Award,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Brain,
  Eye,
  EyeOff,
  Diff,
  XCircle,
  Trophy
} from 'lucide-react';
import { WritingTask, Feedback, HistoryItem, EssaySection } from './types';
import { generateTask, evaluateTranslation } from './geminiService';

const App: React.FC = () => {
  const [currentTask, setCurrentTask] = useState<WritingTask | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [view, setView] = useState<'practice' | 'history'>('practice');

  // Memory Challenge State
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [recallInput, setRecallInput] = useState('');
  const [showRecallComparison, setShowRecallComparison] = useState(false);

  // Load new task
  const fetchNewTask = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    setUserInput('');
    setIsRecallMode(false);
    setRecallInput('');
    setShowRecallComparison(false);
    try {
      const task = await generateTask();
      setCurrentTask(task);
    } catch (error) {
      console.error("Failed to fetch task", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewTask();
  }, [fetchNewTask]);

  const handleSubmit = async () => {
    if (!currentTask || !userInput.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateTranslation(currentTask, userInput);
      setFeedback(result);
      
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        task: currentTask,
        userTranslation: userInput,
        feedback: result,
        timestamp: Date.now()
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRevealComparison = () => {
    setIsRecallMode(false);
    setShowRecallComparison(true);
  };

  const SectionBadge = ({ section }: { section: EssaySection }) => {
    const colors: Record<string, string> = {
      [EssaySection.INTRODUCTION]: 'bg-blue-100 text-blue-700 border-blue-200',
      [EssaySection.BODY_1]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [EssaySection.BODY_2]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      [EssaySection.CONCLUSION]: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[section] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {section}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Award className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">IELTS Writing Master</h1>
          </div>
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setView('practice')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'practice' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Practice
            </button>
            <button 
              onClick={() => setView('history')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              History
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {view === 'practice' ? (
          <div className="space-y-6">
            {/* Task Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 font-medium">Generating task from expert topics...</p>
                  </div>
                ) : currentTask ? (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <SectionBadge section={currentTask.section} />
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight pt-2">
                          {currentTask.vietnamese}
                        </h2>
                        <p className="text-slate-500 text-sm flex items-center gap-1">
                          <BookOpen className="w-4 h-4" /> Topic: <span className="font-semibold text-slate-700">{currentTask.topic}</span>
                        </p>
                      </div>
                      <button 
                        onClick={fetchNewTask}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                        title="New Sentence"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300">
                      <div className="flex items-center gap-2 mb-2 text-slate-600 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" /> Context & Goal
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {currentTask.context}
                      </p>
                    </div>

                    {!feedback && (
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Your Translation
                        </label>
                        <textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Type your English translation here..."
                          className="w-full min-h-[120px] p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg"
                          disabled={isEvaluating}
                        />
                        <button
                          onClick={handleSubmit}
                          disabled={!userInput.trim() || isEvaluating}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                        >
                          {isEvaluating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Analyzing with AI...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Submit Translation
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Feedback Area */}
            {feedback && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
                    <Sparkles className="w-6 h-6" />
                    AI Examiner Feedback
                  </div>
                  <div className="flex gap-2">
                    {showRecallComparison && (
                      <button
                        onClick={() => {
                          setShowRecallComparison(false);
                          setRecallInput('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Hide Comparison
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsRecallMode(!isRecallMode);
                        if (!isRecallMode) {
                          setRecallInput('');
                          setShowRecallComparison(false);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                        isRecallMode 
                          ? 'bg-amber-500 text-white border-transparent' 
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
                      }`}
                    >
                      {isRecallMode ? <Eye className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                      {isRecallMode ? 'Show Sample Sentences' : 'Memory Challenge'}
                    </button>
                  </div>
                </div>

                {showRecallComparison && (
                  <div className="bg-white border-2 border-amber-500 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-top-4">
                    <div className="bg-amber-500 px-6 py-3 flex items-center gap-2 text-white font-bold">
                      <Trophy className="w-5 h-5" />
                      Recall Results
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Your Recall */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Your Memory</span>
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[100px] flex items-center justify-center text-center italic text-slate-800 font-medium leading-relaxed">
                            "{recallInput}"
                          </div>
                        </div>
                        
                        {/* Target Band 7 */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Target (Band 7.0)</span>
                          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 min-h-[100px] flex items-center justify-center text-center italic text-indigo-900 font-bold leading-relaxed">
                            "{feedback.band7Suggestion}"
                          </div>
                        </div>

                        {/* Target Band 8+ */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">Elite (Band 8.5+)</span>
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 min-h-[100px] flex items-center justify-center text-center italic text-amber-900 font-bold leading-relaxed">
                            "{feedback.band8PlusSuggestion}"
                          </div>
                        </div>
                      </div>
                      <div className="text-center pt-2">
                        <button 
                          onClick={() => setShowRecallComparison(false)}
                          className="text-amber-600 font-bold text-sm hover:underline"
                        >
                          I've finished comparing. Close this view.
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {isRecallMode ? (
                  <div className="bg-white rounded-2xl border-2 border-amber-200 p-8 space-y-6 shadow-lg animate-in zoom-in-95 duration-300">
                    <div className="text-center space-y-2">
                      <div className="inline-flex p-4 bg-amber-50 rounded-full text-amber-600 mb-2">
                        <EyeOff className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800">Ready to Test?</h3>
                      <p className="text-slate-500 max-w-md mx-auto">The sample answers are now hidden. Re-type the model version below to see how well you've memorized the advanced structures.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <textarea
                        value={recallInput}
                        onChange={(e) => setRecallInput(e.target.value)}
                        placeholder="Type the sentence you just learned..."
                        className="w-full min-h-[120px] p-6 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-xl font-medium text-slate-700"
                        autoFocus
                      />
                      <button
                        onClick={handleRevealComparison}
                        disabled={!recallInput.trim()}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
                      >
                        Reveal & Compare My Recall
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Band 7 Suggestion */}
                    <div className="bg-white border-l-4 border-indigo-500 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-indigo-900 font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                          Band 7.0 Standard
                        </h3>
                        <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">SOLID</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed italic text-lg">"{feedback.band7Suggestion}"</p>
                    </div>

                    {/* Band 8+ Suggestion */}
                    <div className="bg-slate-900 border-l-4 border-amber-500 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-amber-400 font-bold flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Band 8.5+ Elite
                        </h3>
                        <span className="text-xs font-black bg-white/10 text-amber-200 px-2 py-0.5 rounded">ADVANCED</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed italic text-lg">"{feedback.band8PlusSuggestion}"</p>
                    </div>
                  </div>
                )}

                {/* Analysis Sections */}
                <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-500 ${isRecallMode ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                  <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <h3 className="font-bold text-slate-800">Lexical & Grammatical Breakdown</h3>
                  </div>
                  <div className="p-6 space-y-8">
                    {/* Grammar */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Grammar & Structure</h4>
                      <ul className="space-y-2">
                        {feedback.grammaticalAnalysis.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-slate-700">
                            <ChevronRight className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Vocabulary */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Vocabulary Upgrades</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {feedback.vocabularyUpgrades.map((item, idx) => (
                          <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="line-through text-slate-400 text-sm">{item.word}</span>
                              <ChevronRight className="w-3 h-3 text-indigo-400" />
                              <span className="text-indigo-600 font-bold">{item.improvement}</span>
                            </div>
                            <p className="text-xs text-slate-500">{item.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cohesion */}
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <h4 className="text-sm font-bold text-indigo-700 mb-2">Essay Flow & Tone Advice</h4>
                      <p className="text-indigo-900 text-sm leading-relaxed">
                        {feedback.cohesionAdvice}
                      </p>
                    </div>
                  </div>
                </div>

                {!isRecallMode && (
                  <div className="flex justify-center pt-4 pb-12">
                    <button 
                      onClick={fetchNewTask}
                      className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-xl hover:-translate-y-1"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Next Challenge
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Learning History</h2>
            {history.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Your practice history will appear here.</p>
                <button 
                  onClick={() => setView('practice')}
                  className="mt-4 text-indigo-600 font-semibold"
                >
                  Start Practicing Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <SectionBadge section={item.task.section} />
                        <h4 className="font-bold text-slate-900 pt-1">{item.task.vietnamese}</h4>
                        <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setCurrentTask(item.task);
                          setUserInput(item.userTranslation);
                          setFeedback(item.feedback);
                          setIsRecallMode(false);
                          setShowRecallComparison(false);
                          setView('practice');
                        }}
                        className="text-indigo-600 text-sm font-bold hover:underline"
                      >
                        Review
                      </button>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-sm">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">Your Translation</p>
                      <p className="text-slate-700 italic">"{item.userTranslation}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            Powered by Gemini AI • Master IELTS Writing Task 2 with Expert Model Answers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

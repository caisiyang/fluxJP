import React, { useState } from 'react';
import { Sentence } from '../types';
import { Volume2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak, isTTSAvailable } from '../lib/tts';

interface ContextCardProps {
  sentence: Sentence;
  isActive?: boolean;
}

export const ContextCard: React.FC<ContextCardProps> = ({ sentence }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTTSAvailable()) {
      speak(text);
    }
  };

  return (
    <div
      className="w-full bg-white mb-3 rounded-2xl border border-slate-100 shadow-sm p-5 active:bg-slate-50 transition-colors cursor-pointer overflow-hidden"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 leading-relaxed font-sans">
            {sentence.japanese}
          </h3>
        </div>
        <button className="text-slate-300 mt-1">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Translation */}
              <p className="text-slate-500 text-sm font-medium">
                {sentence.english}
              </p>

              {/* Grammar Analysis */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">语法解析</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {sentence.grammar || "暂无语法解析。"}
                </p>
              </div>

              {/* Audio Action */}
              <div className="flex justify-end pt-2">
                <button
                  className="p-2.5 rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-500 hover:text-white transition-colors"
                  onClick={(e) => handleSpeak(sentence.japanese, e)}
                >
                  <Volume2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
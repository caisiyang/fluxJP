import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Play, Heart } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getFavorites, removeFavorite, removeFavorites, clearFavorites } from '../lib/db';
import { Favorite } from '../types';

interface FavoritesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onStartReview: () => void;
}

export const FavoritesDialog: React.FC<FavoritesDialogProps> = ({
    isOpen,
    onClose,
    onStartReview
}) => {
    const favorites = useLiveQuery(() => getFavorites(), []) || [];
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const toggleSelect = (wordId: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(wordId)) {
            newSet.delete(wordId);
        } else {
            newSet.add(wordId);
        }
        setSelectedIds(newSet);
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        await removeFavorites(Array.from(selectedIds));
        setSelectedIds(new Set());
    };

    const handleClearAll = async () => {
        if (favorites.length === 0) return;
        await clearFavorites();
        setSelectedIds(new Set());
    };

    const handleRemoveOne = async (wordId: number) => {
        await removeFavorite(wordId);
        selectedIds.delete(wordId);
        setSelectedIds(new Set(selectedIds));
    };

    const handleStartReview = () => {
        if (favorites.length === 0) return;
        onStartReview();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md max-h-[70vh] bg-[#F7F6F2] dark:bg-[#1a1a1a] rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#E8E6E0] dark:border-[#3a3a3a]">
                            <div className="flex items-center gap-2">
                                <Heart size={20} className="text-rose-500" fill="currentColor" />
                                <h2 className="text-lg font-bold text-slate-800 dark:text-[#f5f5f0]">收藏夹</h2>
                                <span className="text-xs text-slate-400 dark:text-[#888]">({favorites.length})</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[#E8E6E0] dark:hover:bg-[#2a2a2a] rounded-xl transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {favorites.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Heart size={48} className="text-slate-200 dark:text-[#3a3a3a] mb-4" />
                                    <p className="text-slate-400 dark:text-[#888] text-sm">暂无收藏</p>
                                    <p className="text-slate-300 dark:text-[#555] text-xs mt-1">
                                        在学习卡片中点击 ❤️ 添加收藏
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {favorites.map((fav) => (
                                        <div
                                            key={fav.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedIds.has(fav.wordId)
                                                    ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                                                    : 'bg-white dark:bg-[#2a2a2a] border-[#E8E6E0] dark:border-[#3a3a3a] hover:bg-[#EDEBE5] dark:hover:bg-[#333]'
                                                }`}
                                            onClick={() => toggleSelect(fav.wordId)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold text-slate-800 dark:text-[#f5f5f0]">
                                                        {fav.word}
                                                    </span>
                                                    <span className="text-sm text-slate-500 dark:text-[#a5a5a0]">
                                                        {fav.reading}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 dark:text-[#888] truncate">
                                                    {fav.meaning}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveOne(fav.wordId);
                                                }}
                                                className="p-2 text-slate-300 dark:text-[#555] hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        {favorites.length > 0 && (
                            <div className="p-4 border-t border-[#E8E6E0] dark:border-[#3a3a3a] space-y-3">
                                {/* Review Button */}
                                <button
                                    onClick={handleStartReview}
                                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Play size={18} />
                                    复习收藏夹
                                </button>

                                {/* Delete Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeleteSelected}
                                        disabled={selectedIds.size === 0}
                                        className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors ${selectedIds.size > 0
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
                                                : 'bg-[#E8E6E0] dark:bg-[#2a2a2a] text-slate-300 dark:text-[#555] cursor-not-allowed'
                                            }`}
                                    >
                                        <Trash2 size={14} />
                                        删除选中 ({selectedIds.size})
                                    </button>
                                    <button
                                        onClick={handleClearAll}
                                        className="flex-1 py-2 rounded-xl text-xs font-medium bg-[#E8E6E0] dark:bg-[#2a2a2a] text-slate-500 dark:text-[#888] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        清空全部
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

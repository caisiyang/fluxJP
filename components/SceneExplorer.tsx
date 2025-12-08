import React from 'react';
import { Scenario } from '../types';
import { MapPin, Store, Utensils, User, Tent } from 'lucide-react';

interface SceneExplorerProps {
    scenarios: Scenario[];
    onSelect: (scenario: Scenario) => void;
}

export const SceneExplorer: React.FC<SceneExplorerProps> = ({ scenarios, onSelect }) => {
    const getIcon = (iconName: string | undefined) => {
        switch (iconName) {
            case 'Store': return Store;
            case 'Utensils': return Utensils;
            case 'MapPin': return MapPin;
            case 'User': return User;
            default: return Tent;
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-sm font-black text-slate-800 dark:text-[#e5e5e0] mb-5 pl-2 tracking-tight">场景探索</h2>
            <div className="grid grid-cols-2 gap-4">
                {scenarios.map((scenario) => {
                    const Icon = getIcon(scenario.icon);
                    return (
                        <button
                            key={scenario.id}
                            onClick={() => onSelect(scenario)}
                            className="flex flex-col items-start p-5 clay-card hover:translate-y-[-2px] active:translate-y-[1px] transition-all duration-200 text-left min-h-[140px] group"
                        >
                            <div className="mb-4">
                                <div className="relative text-[#D45D5D] transition-transform duration-300 group-hover:scale-110">
                                    <div className="absolute inset-0 bg-[#D45D5D] blur-xl opacity-10 rounded-full" />
                                    <Icon size={32} fill="currentColor" strokeWidth={0} className="drop-shadow-sm" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-700 dark:text-[#e5e5e0] text-sm">{scenario.title}</h3>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#D45D5D]/10 text-[#D45D5D] font-bold">
                                    Lv.{scenario.difficulty}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-[#a5a5a0] line-clamp-2 leading-relaxed font-medium">
                                {scenario.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

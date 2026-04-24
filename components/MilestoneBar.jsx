import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const MilestoneBar = ({ milestones, completedIds, status }) => {
    if (!milestones || milestones.length === 0) return null;

    const totalSteps = milestones.length;

    // Find the index of the last completed milestone to fill the progress bar
    const lastCompletedIndex = milestones.reduce((lastIdx, ms, idx) => {
        return (completedIds.includes(ms.id) || status === 'Completed') ? idx : lastIdx;
    }, -1);

    const progressPercentage = totalSteps > 1 
        ? (lastCompletedIndex / (totalSteps - 1)) * 100 
        : 0;

    return (
        <div className="w-full py-14 px-2">
            <div className="relative flex items-center justify-between w-full">
                
                {/* Background Track (Gray) */}
                <div className="absolute left-0 top-1/2 w-full h-1.5 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
                
                {/* Active Progress Fill (Green) */}
                <div 
                    className="absolute left-0 top-1/2 h-1.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
                
                {milestones.map((ms, index) => {
                    const isCompleted = completedIds.includes(ms.id) || status === 'Completed';
                    const isCurrent = index === lastCompletedIndex + 1;
                    
                    // Calculate individual step percentage (e.g., Step 1 of 7 = 14%)
                    const stepPercentage = Math.round(((index + 1) / totalSteps) * 100);
                    
                    return (
                        <div 
                            key={ms.id} 
                            className="relative z-10 flex flex-col items-center flex-1"
                        >
                            {/* Icon Node */}
                            <div className={`relative flex items-center justify-center rounded-full transition-all duration-500 ${
                                isCompleted 
                                ? 'bg-green-600 scale-110 shadow-lg shadow-green-200' 
                                : isCurrent 
                                ? 'bg-white border-4 border-green-500 scale-105'
                                : 'bg-white border-4 border-gray-200'
                            } w-8 h-8`}>
                                {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                ) : (
                                    <div className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-green-500 animate-pulse' : 'bg-gray-200'}`} />
                                )}
                            </div>
                            
                            {/* Label Container */}
                            <div className="absolute top-10 w-full flex flex-col items-center px-1">
                                <p className={`text-[10px] sm:text-xs font-bold text-center leading-tight transition-colors duration-300 max-w-[80px] break-words ${
                                    isCompleted ? 'text-green-700' : 'text-gray-500'
                                }`}>
                                    {ms.milestone_name}
                                </p>
                                
                                {/* Step Count and Percentage Label */}
                                <div className="flex flex-col items-center mt-1">
                                    <span className="text-[9px] uppercase tracking-wider text-gray-400">
                                        Step {index + 1} of {totalSteps}
                                    </span>
                                    <span className={`text-[10px] font-semibold ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                        {stepPercentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MilestoneBar;
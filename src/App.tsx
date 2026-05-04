/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Equal, RotateCcw, Zap } from 'lucide-react';

// --- Types & Constants ---

type StoneType = 'x' | 'a' | '1';

interface StoneState {
  x: number;
  a: number;
  one: number;
}

const INITIAL_STATE: StoneState = { x: 0, a: 0, one: 0 };

// --- Helpers ---

const formatExpression = (state: StoneState): string => {
  const parts: string[] = [];

  const addPart = (val: number, label: string) => {
    if (val === 0) return;
    
    const absVal = Math.abs(val);
    const numStr = (absVal === 1 && label !== '') ? '' : absVal.toString();
    const term = `${numStr}${label}`;

    if (parts.length > 0) {
      parts.push(val > 0 ? ` + ${term}` : ` - ${term}`);
    } else {
      parts.push(val > 0 ? term : `-${term}`);
    }
  };

  addPart(state.x, 'x');
  addPart(state.a, 'a');
  addPart(state.one, '');

  return parts.length === 0 ? '0' : parts.join('');
};

// --- Components ---

const StoneIcon = ({ type, value, size = 36, onClick, labelOnly = false }: { type: StoneType; value: number; size?: number; onClick?: () => void, labelOnly?: boolean }) => {
  const isPositive = value > 0;
  const color = isPositive ? 'bg-blue-500' : 'bg-rose-500';
  
  let labelText = '';
  if (type === '1') labelText = isPositive ? '1' : '-1';
  else labelText = isPositive ? type : `-${type}`;

  const commonClasses = "flex items-center justify-center text-white font-bold shadow-md select-none";

  return (
    <motion.div 
      whileHover={onClick ? { scale: 1.1 } : {}}
      whileTap={onClick ? { scale: 0.9 } : {}}
      onClick={onClick}
      className={`relative flex items-center justify-center ${onClick ? 'cursor-pointer' : ''}`} 
      style={{ width: size, height: size }}
    >
      {type === 'x' && (
        <div 
          className={`${commonClasses} ${color} w-full h-full text-[10px] md:text-sm`}
          style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
        >
          {labelText}
        </div>
      )}
      {type === 'a' && (
        <div className={`${commonClasses} ${color} w-full h-full rounded-sm text-[10px] md:text-sm`}>
          {labelText}
        </div>
      )}
      {type === '1' && (
        <div className={`${commonClasses} ${color} w-full h-full rounded-full text-[10px] md:text-sm`}>
          {labelText}
        </div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [box1, setBox1] = useState<StoneState>({ ...INITIAL_STATE });
  const [box2, setBox2] = useState<StoneState>({ ...INITIAL_STATE });
  const [showResult, setShowResult] = useState(false);

  const [frozenBox1, setFrozenBox1] = useState<StoneState | null>(null);
  const [frozenBox2, setFrozenBox2] = useState<StoneState | null>(null);

  const handleAddStone = (boxNum: 1 | 2, type: 'x' | 'a' | 'one', delta: number) => {
    const setter = boxNum === 1 ? setBox1 : setBox2;
    setter((prev) => {
      const currentVal = prev[type];
      // Logic for cancellation: if current > 0 and delta < 0, or current < 0 and delta > 0
      // But actually the request said: if adding -x when x exists, remove x.
      // So if currentVal = 3 and delta = -1, result is 2.
      // if currentVal = -2 and delta = 1, result is -1.
      return { ...prev, [type]: currentVal + delta };
    });
    setShowResult(false);
  };

  const handleReset = () => {
    setBox1({ ...INITIAL_STATE });
    setBox2({ ...INITIAL_STATE });
    setShowResult(false);
    setFrozenBox1(null);
    setFrozenBox2(null);
  };

  const handleSum = () => {
    setFrozenBox1({ ...box1 });
    setFrozenBox2({ ...box2 });
    setShowResult(true);
  };

  const resultState: StoneState = useMemo(() => {
    if (!frozenBox1 || !frozenBox2) return INITIAL_STATE;
    return {
      x: frozenBox1.x + frozenBox2.x,
      a: frozenBox1.a + frozenBox2.a,
      one: frozenBox1.one + frozenBox2.one,
    };
  }, [frozenBox1, frozenBox2]);

  const renderStones = (state: StoneState, boxIndex: 1 | 2, interactive = false) => {
    const stones: React.ReactNode[] = [];
    
    (['x', 'a', 'one'] as const).forEach((t) => {
      const count = state[t];
      if (count === 0) return;
      const displayType = t === 'one' ? '1' : t;
      const isPos = count > 0;
      const absCount = Math.abs(count);
      for (let i = 0; i < absCount; i++) {
        stones.push(
          <motion.div
            key={`${t}-${isPos}-${i}`}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="m-0.5"
          >
            <StoneIcon 
              type={displayType as StoneType} 
              value={isPos ? 1 : -1} 
              size={36}
              onClick={interactive ? () => handleAddStone(boxIndex, t, isPos ? -1 : 1) : undefined}
            />
          </motion.div>
        );
      }
    });

    return (
      <div className="flex flex-wrap gap-1 justify-center items-center h-full w-full overflow-y-auto">
        <AnimatePresence>
          {stones.length > 0 ? stones : (
             <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="text-slate-400 text-sm italic font-medium">비어있음</motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const ControlPanel = ({ boxNum }: { boxNum: 1 | 2 }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-6">
        <StoneIcon type="x" value={1} size={42} onClick={() => handleAddStone(boxNum, 'x', 1)} />
        <StoneIcon type="a" value={1} size={42} onClick={() => handleAddStone(boxNum, 'a', 1)} />
        <StoneIcon type="1" value={1} size={42} onClick={() => handleAddStone(boxNum, 'one', 1)} />
        <StoneIcon type="x" value={-1} size={42} onClick={() => handleAddStone(boxNum, 'x', -1)} />
        <StoneIcon type="a" value={-1} size={42} onClick={() => handleAddStone(boxNum, 'a', -1)} />
        <StoneIcon type="1" value={-1} size={42} onClick={() => handleAddStone(boxNum, 'one', -1)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-4 md:p-12 font-sans text-slate-800">
      <div className="w-full max-w-7xl space-y-10">
        
        <header className="flex flex-col gap-1 mb-4">
          <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">일차식의 덧셈</h1>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-start">
          
          {/* Box 1 Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#EBF5FF] text-[#2563EB] font-bold text-center py-2.5 rounded-xl border border-blue-50 shadow-sm text-lg truncate px-2">
              ({formatExpression(box1)})
            </div>
            <div className="aspect-[3/2] bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner flex items-center justify-center relative p-6">
               {renderStones(box1, 1, true)}
            </div>
            <ControlPanel boxNum={1} />
          </div>

          {/* Plus Sign */}
          <div className="lg:col-span-1 flex justify-center lg:mt-32">
            <span className="text-4xl font-black text-slate-300"><Plus size={48} /></span>
          </div>

          {/* Box 2 Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#EBF5FF] text-[#2563EB] font-bold text-center py-2.5 rounded-xl border border-blue-50 shadow-sm text-lg truncate px-2">
              ({formatExpression(box2)})
            </div>
            <div className="aspect-[3/2] bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner flex items-center justify-center relative p-6">
               {renderStones(box2, 2, true)}
            </div>
            <ControlPanel boxNum={2} />
          </div>

          {/* Equals Sign */}
          <div className="lg:col-span-1 flex justify-center lg:mt-32">
            <span className="text-4xl font-black text-slate-300"><Equal size={48} /></span>
          </div>

          {/* Result Box Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className={`text-center py-2.5 rounded-xl border shadow-sm text-lg font-black transition-all truncate px-2 ${showResult ? 'bg-[#FFF0F0] text-[#E11D48] border-rose-100' : 'bg-slate-100 text-slate-300 border-slate-100'}`}>
              {showResult ? formatExpression(resultState) : '?'}
            </div>
            <div className={`aspect-[3/2] rounded-3xl border-2 border-slate-200 shadow-xl flex flex-col overflow-hidden p-4 relative ${showResult ? 'bg-white' : 'bg-slate-50'}`}>
               {!showResult ? (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-2 text-slate-400">
                    <Zap size={64} />
                    <p className="text-sm font-medium">계산 결과가 여기에 표시됩니다</p>
                 </div>
               ) : (
                  <div className="flex flex-col h-full gap-2">
                    <div className="flex-1 border-b border-slate-100 flex items-center">
                       {renderStones(frozenBox1!, 1)}
                    </div>
                    <div className="flex-1 flex items-center">
                       {renderStones(frozenBox2!, 2)}
                    </div>
                  </div>
               )}
            </div>
            
            {/* Action Buttons under Result Box */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSum}
                className="w-full py-5 bg-[#5D5FEF] hover:bg-[#4B4DCC] text-white rounded-2xl font-black text-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.97]"
              >
                <Plus size={24} strokeWidth={3} />
                더하기
              </button>
              <button 
                onClick={handleReset}
                className="w-full py-4 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] border border-rose-100 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              >
                <RotateCcw size={20} strokeWidth={2.5} />
                전체 초기화
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


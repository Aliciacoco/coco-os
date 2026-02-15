"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * 通用拖拽吸附组件
 * @param img 图片链接
 * @param targetX 目标偏移X
 * @param targetY 目标偏移Y
 * @param range 判定范围(px)
 */
export const DraggableComponent = ({ img, targetX = 150, targetY = 0, range = 60 }: any) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const tx = Number(targetX);
  const ty = Number(targetY);
  const r = Number(range);

  const handleDragEnd = (_: any, info: any) => {
    if (isSuccess) return;
    const { x, y } = info.offset;
    const distance = Math.sqrt(Math.pow(x - tx, 2) + Math.pow(y - ty, 2));

    if (distance < r) {
      // 判定成功：强制吸附
      setPosition({ x: tx, y: ty });
      setIsSuccess(true);
    } else {
      // 判定失败：留在原地
      setPosition({ x, y });
    }
  };

  return (
    <div className="relative inline-block my-12 group select-none">
      {/* 辅助目标框 */}
      {!isSuccess && (
        <div 
          className="absolute border-2 border-dashed border-blue-200 rounded-2xl pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-blue-300 font-bold"
          style={{ width: '120px', height: '120px', transform: `translate(${tx}px, ${ty}px)`, left: 0, top: 0 }}
        >
          TARGET
        </div>
      )}
      
      <motion.div
        drag={!isSuccess}
        animate={{ x: position.x, y: position.y, scale: isSuccess ? 1.1 : 1 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileHover={!isSuccess ? { scale: 1.05, cursor: "grab" } : {}}
        whileTap={!isSuccess ? { scale: 0.95, cursor: "grabbing" } : {}}
        className="inline-block z-50 relative"
        style={{ touchAction: 'none' }} 
      >
        <img 
          src={img} 
          alt="interactive" 
          className="w-32 h-auto pointer-events-none drop-shadow-2xl rounded-2xl" 
        />
        {isSuccess && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1.2 }} 
            className="absolute -top-4 -right-4 bg-green-500 text-white p-1.5 rounded-full shadow-lg z-[60]"
          >
            <Check size={16} strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>

      {isSuccess && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-8 left-0 w-full text-xs font-black text-green-500 text-center uppercase tracking-widest">
          Success
        </motion.p>
      )}
    </div>
  );
};
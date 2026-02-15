"use client";
import { useState, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';

export const CalendarGallery = ({ assets, onClose, onDelete }: any) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 1. 过滤出日程类型的资产
  const events = useMemo(() => 
    assets.filter((a: any) => a.type === 'EVENT'),
    [assets]
  );

  // 2. 生成日历格子所需的日期数组
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // 3. 辅助函数：获取特定日期的事件
  const getDayEvents = (day: Date) => {
    return events.filter((event: any) => {
      const dateStr = event.metadata?.date;
      if (!dateStr) return false;
      // 兼容 YYYY-MM-DD 格式
      return isSameDay(parseISO(dateStr), day);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header: 包含月份切换控制 */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                <CalendarIcon size={20} />
              </div>
              <h2 className="text-xl font-black italic tracking-tighter">Life Calendar</h2>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-orange-600"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-black w-32 text-center text-slate-700">
                {format(currentMonth, 'yyyy年 MM月')}
              </span>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-orange-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {/* 星期表头 */}
          <div className="grid grid-cols-7 mb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-300 tracking-widest pb-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日历格子矩阵 */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dayEvents = getDayEvents(day);
              const isToday = isSameDay(day, new Date());
              const isThisMonth = isSameMonth(day, currentMonth);

              return (
                <div 
                  key={idx}
                  className={`min-h-[120px] bg-white rounded-2xl border transition-all flex flex-col p-2 group
                    ${isThisMonth ? 'border-slate-100 shadow-sm' : 'border-transparent opacity-30 pointer-events-none'}
                    ${isToday ? 'ring-2 ring-orange-400 border-transparent' : 'hover:border-orange-200'}
                  `}
                >
                  {/* 日期数字 */}
                  <div className={`text-xs font-black mb-2 flex items-center justify-between ${isToday ? 'text-orange-600' : 'text-slate-400'}`}>
                    <span>{format(day, 'd')}</span>
                    {isToday && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />}
                  </div>

                  {/* 事件条列表 */}
                  <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                    {dayEvents.map((event: any) => (
                      <div 
                        key={event.id}
                        className="relative p-1.5 bg-orange-50 border border-orange-100 rounded-lg group/item"
                      >
                        <p className="text-[10px] font-bold text-orange-700 leading-tight truncate pr-4">
                          {event.title}
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
                          className="absolute right-1 top-1 text-orange-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="px-8 py-4 border-t border-slate-50 bg-white flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
           <span>Total: {events.length} Events</span>
           <span>Current View: {format(currentMonth, 'MMMM yyyy')}</span>
        </div>
      </div>
    </div>
  );
};
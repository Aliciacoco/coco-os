"use client";
import { useState } from 'react';
import { Globe, X, Plus, Trash2 } from 'lucide-react';

/**
 * LinkGallery - 网址/工具收藏夹
 * 已经将所有 type 从 TOOL 统一修改为 LINK
 */
export const LinkGallery = ({ assets, onDelete, onClose, onAdd, isAdmin, onInsertLink }: any) => {
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  
  // 🚀 核心修改：筛选逻辑改为大写的 LINK
  const links = assets.filter((a: any) => a.type === 'LINK');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newTitle) return;
    
    // 🚀 核心修改：手动添加时，type 也发送为 LINK
    onAdd({ 
      title: newTitle, 
      content: newUrl, 
      type: 'LINK', 
      published: true 
    });
    
    setNewUrl('');
    setNewTitle('');
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 p-6 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black flex items-center gap-2 text-slate-900">
          <Globe size={20} className="text-blue-600" /> 网址收藏夹
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>
      </div>

      {/* 新增工具表单 */}
      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50 rounded-2xl space-y-3 border border-slate-100 shadow-inner">
          <input 
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 ring-blue-100 transition-all text-slate-900" 
            placeholder="名称 (如: Github)" 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <input 
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 ring-blue-100 transition-all font-mono text-slate-900" 
            placeholder="URL (https://...)" 
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
          />
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
            <Plus size={14} strokeWidth={3} /> 收藏新网址
          </button>
        </form>
      )}

      {/* 列表展示 */}
      <div className="space-y-3">
        {links.map((link: any) => (
          <div key={link.id} className="group flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all bg-white text-slate-900">
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.content)}&sz=64`} 
                className="w-7 h-7 rounded-lg shadow-sm border border-slate-50" 
                alt=""
                onError={(e:any) => e.target.src = 'https://www.google.com/s2/favicons?domain=github.com'}
              />
              <div className="overflow-hidden">
                <p className="text-sm font-black truncate text-slate-700">{link.title}</p>
                <p className="text-[10px] text-slate-300 truncate font-mono">{link.content}</p>
              </div>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
              {onInsertLink && (
                <button 
                  onClick={() => onInsertLink(link.title, link.content)} 
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="引用到正文"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              )}

              <a 
                href={link.content} 
                target="_blank" 
                rel="noreferrer" 
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Globe size={16}/>
              </a>
              
              {isAdmin && (
                <button 
                  onClick={() => onDelete(link.id)} 
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {links.length === 0 && (
        <p className="text-center text-slate-200 mt-20 text-[10px] font-black uppercase tracking-widest">Garden is Empty</p>
      )}
    </div>
  );
};
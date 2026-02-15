"use client";
import { ImageIcon, X, Loader2, Upload, Plus, Trash2 } from 'lucide-react';

/**
 * ImageGallery - 腾讯云图库侧边栏
 * @param assets 所有的资产列表
 * @param onInsert 插入图片到 Markdown 的回调
 * @param onDelete 删除图片资产的回调
 * @param onClose 关闭侧边栏
 * @param onUpload 上传新图片的处理函数
 * @param uploading 上传状态锁定
 */
export const ImageGallery = ({ assets, onInsert, onDelete, onClose, onUpload, uploading }: any) => {
  // 仅筛选图片类型的资产
  const images = assets.filter((a: any) => a.type === 'IMAGE');

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 p-6 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-100">
      {/* 头部控制栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          <ImageIcon size={20} className="text-blue-600" /> 腾讯云图库
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* 上传区域 */}
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all mb-6 group">
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400 group-hover:text-blue-500">
          {uploading ? <Loader2 className="animate-spin mb-2" /> : <Upload className="mb-2" />}
          <p className="text-sm font-bold tracking-tight">点击上传新图片到云端</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => onUpload(e, false)} 
          disabled={uploading} 
        />
      </label>

      {/* 图片网格展示 */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((img: any) => (
          <div key={img.id} className="group relative aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
            <img src={img.content} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" alt="gallery" />
            
            {/* 悬浮操作层 */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button 
                onClick={() => onInsert(img.content)} 
                className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 active:scale-95 transition-all shadow-xl"
                title="插入到文档"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
              <button 
                onClick={() => { if(confirm("确定删除该图片资产吗？")) onDelete(img.id); }} 
                className="p-2 bg-white rounded-full text-red-600 hover:scale-110 active:scale-95 transition-all shadow-xl"
                title="删除"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <ImageIcon size={48} strokeWidth={1} className="mb-4 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest">No Assets Found</p>
        </div>
      )}
    </div>
  );
};
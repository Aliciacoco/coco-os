"use client";
import { Pencil, Trash2, Layers, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const AssetCard = ({ asset, isAdmin, onAction }: any) => {
  const router = useRouter();

  // 1. 提取预览图：最多提取一行（3张）
  const getPreviewImages = (c: string) => {
    if (!c) return [];
    const m = c.match(/!\[.*?\]\((.*?)\)/g);
    return m ? m.slice(0, 3).map(i => i.match(/\((.*?)\)/)![1]) : [];
  };

  // 2. 清洗正文预览：过滤图片、链接格式，以及互动组件代码（如 <drag ... />）
  const getCleanText = (content: string) => {
    if (!content) return "";
    return content
      .replace(/<[^>]*\/>/g, '') // 过滤形如 <drag ... /> 的自闭合组件
      .replace(/<[^>]*>[\s\S]*?<\/[^>]*>/g, '') // 过滤成对的 HTML/组件标签
      .replace(/!\[.*?\]\(.*?\)/g, '') // 过滤图片
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 提取链接文字
      .replace(/[#*`>!\-_~]/g, '') // 过滤 Markdown 符号
      .replace(/\n+/g, ' ') // 换行转空格
      .trim();
  };

  const images = getPreviewImages(asset.content);
  const cleanText = getCleanText(asset.content);

  return (
    <article className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      {/* 内容区 */}
      <div className="p-8 relative flex flex-col flex-1">
        {/* 管理员操作按钮 */}
        {isAdmin && (
          <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
            <button 
              onClick={() => router.push(`/admin/publish?id=${asset.id}`)} 
              className="p-2 bg-white border shadow-sm rounded-full text-blue-600 hover:scale-110 transition-all"
            >
              <Pencil size={18}/>
            </button>
            <button 
              onClick={() => { if(confirm("确定删除这篇文章吗？")) onAction('DELETE', `http://localhost:3000/assets/${asset.id}`); }} 
              className="p-2 bg-white border shadow-sm rounded-full text-red-600 hover:scale-110 transition-all"
            >
              <Trash2 size={18}/>
            </button>
          </div>
        )}

        {/* 头部元数据 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">{asset.type}</span>
            <span className="text-xs font-bold text-slate-300">{new Date(asset.createdAt).toLocaleDateString()}</span>
          </div>
          {isAdmin && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white ${asset.published ? 'bg-green-500' : 'bg-slate-400'}`}>
              {asset.published ? 'Public' : 'Private'}
            </span>
          )}
        </div>

        {/* 标题 */}
        <h3 className="text-2xl font-black mb-3 tracking-tighter line-clamp-2 group-hover:text-blue-600 transition-colors">
          {asset.title}
        </h3>

        {/* 文字预览 */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6">
          {cleanText.substring(0, 120)}{cleanText.length > 120 ? '...' : ''}
        </p>

        {/* 图片展示区：仅在有图片时展示，一行排列 */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6 mt-auto">
            {images.map((src, idx) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-50">
                <img 
                  src={src} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                  alt={`preview-${idx}`} 
                />
              </div>
            ))}
          </div>
        )}

        {/* 底部链接 */}
        <div className="mt-auto pt-4">
          <Link href={`/post/${asset.id}`} className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:gap-3 transition-all tracking-widest">
            VIEW DETAILS <ChevronRight size={14}/>
          </Link>
        </div>
      </div>
    </article>
  );
};
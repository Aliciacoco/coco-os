"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; 
import { ChevronLeft, Check, Calendar, User } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { DraggableComponent } from '@/components/Draggable'; // ✨ 引入核心组件


const markdownComponents: Record<string, any> = {
  // 解决嵌套报错
  p: (props: any) => <div className="mb-4">{props.children}</div>,
  // 详情页渲染真实的互动逻辑
  drag: (props: any) => (
    <DraggableComponent 
      img={props.img} 
      targetX={props.x} 
      targetY={props.y} 
      range={props.range} 
    />
  )
};

export default function PublicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 提醒：在本地测试用 localhost，部署到上海服务器后请改为你的域名/IP
    fetch(`http://localhost:3000/assets/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setAsset(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("加载失败", err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-300 animate-pulse text-sm tracking-widest uppercase">Loading...</div>;
  
  if (!asset || (!asset.published && !localStorage.getItem('admin_pwd'))) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Content Unavailable.</div>;
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-50 mb-12">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all font-black text-[10px] tracking-widest uppercase"
          >
            <ChevronLeft size={18} /> Back
          </button>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6">
        <header className="mb-16 space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {asset.type}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]">
            {asset.title}
          </h1>
        </header>

        {/* 文章正文 */}
        <div className="prose prose-lg prose-slate max-w-none 
          prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tighter
          prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg">
          
          <ReactMarkdown 
            components={markdownComponents} 
            rehypePlugins={[rehypeRaw]}
          >
            {asset.content}
          </ReactMarkdown>
        </div>

        <footer className="mt-20 pt-10 border-t border-slate-50 text-center text-slate-200">
           <p className="text-[10px] font-black tracking-[0.2em] uppercase">Life OS Digital Garden</p>
        </footer>
      </article>
    </main>
  );
}
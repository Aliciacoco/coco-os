"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, Plus, Unlock, Lock, Loader2, 
  Image as ImageIcon, Sparkles, Calendar as CalendarIcon 
} from 'lucide-react';

import { AuthService, AssetService } from '@/services/authService';
import { ImageGallery } from '@/components/ImageGallery';
import { LinkGallery } from '@/components/LinkGallery';
import { AssetCard } from '@/components/AssetCard';
import { CalendarGallery } from '@/components/CalendarGallery'; // 需新建此组件

export default function UnifiedPage() {
  const router = useRouter();
  
  // 数据状态
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // UI 状态
  const [showGallery, setShowGallery] = useState(false);
  const [showLinkGallery, setShowLinkGallery] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // AI 指令状态
  const [aiCommand, setAiCommand] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const authStatus = AuthService.isLoggedIn();
    setIsAdmin(authStatus);
    loadData(authStatus);
  }, []);

  const loadData = async (authStatus: boolean) => {
    setLoading(true);
    try {
      const data = await AssetService.fetchAssets(authStatus);
      setAssets(data);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') AuthService.logout();
    } finally {
      setLoading(false);
    }
  };

  // 核心分发逻辑
  const handleAction = async (method: string, url: string, body?: any) => {
    try {
      await AssetService.executeAction(method, url, body);
      if (method === 'DELETE') {
        const deletedId = parseInt(url.split('/').pop() || "");
        if (!isNaN(deletedId)) {
          setAssets(prev => prev.filter((a: any) => a.id !== deletedId));
        }
      } else {
        await loadData(isAdmin);
      }
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') AuthService.logout();
      else alert("操作失败");
    }
  };

  // 🚀 AI 全能指令处理函数
  const handleOmniAI = async () => {
  if (!aiCommand.trim()) return;
  setIsAiLoading(true);
  console.log("🚀 开始发送指令:", aiCommand); // 添加日志

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-password': localStorage.getItem('admin_pwd') || '' 
      },
      body: JSON.stringify({ command: aiCommand })
    });

    console.log("📡 收到响应，状态码:", res.status); // 添加日志

    if (res.status === 401) {
      alert("登录失效，请重新登录");
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ 后端返回错误:", errorData);
      throw new Error(errorData.error || '请求失败');
    }

    const result = await res.json();
    console.log("✅ 解析结果:", result); // 添加日志
    
    alert(`成功创建：[${result.type}] ${result.title || result.asset?.title}`);
    setAiCommand("");
    loadData(isAdmin);
  } catch (e: any) {
    console.error("🔥 捕获到异常:", e); // 这行代码非常重要！
    alert(`AI 解析失败: ${e.message || '请检查网络或后端控制台'}`);
  } finally {
    setIsAiLoading(false);
  }
};

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const cosData = await AssetService.upload(file);
      await AssetService.executeAction('POST', 'http://localhost:3000/assets', {
        type: 'IMAGE', title: file.name, content: cosData.url, metadata: { cosKey: cosData.cosKey }
      });
      loadData(isAdmin);
    } catch (err) {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-200 animate-pulse tracking-widest uppercase">Loading...</div>;

  return (
    <main className="min-h-screen bg-black/5 text-slate-900 font-sans">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center gap-6">
          {/* Logo */}
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Globe size={18} />
            </div>
            <span>Life OS</span>
          </h1>

          {/* 🚀 AI 指令框 (仅管理员可见) */}
          {isAdmin && (
            <div className="flex-1 max-w-md relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              </div>
              <input 
                value={aiCommand}
                onChange={(e) => setAiCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOmniAI()}
                className="w-full bg-slate-100/80 border border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none pl-12 pr-4 py-2.5 rounded-2xl text-sm transition-all"
                placeholder="下个月5号参加婚礼 / 提醒我买咖啡..."
              />
            </div>
          )}

          {/* 右侧工具抽屉 */}
          <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 shrink-0">
            {isAdmin ? (
              <>
                <button onClick={() => setShowCalendar(true)} className="p-2.5 text-slate-500 hover:text-orange-600 hover:bg-white rounded-xl transition-all" title="日历库">
                  <CalendarIcon size={20}/>
                </button>
                <button onClick={() => setShowLinkGallery(true)} className="p-2.5 text-slate-500 hover:text-blue-600 transition-all" title="工具库">
                  <Globe size={20}/>
                </button>
                <button onClick={() => setShowGallery(true)} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all" title="图片库">
                  {uploading ? <Loader2 className="animate-spin" size={20}/> : <ImageIcon size={20}/>}
                </button>
                
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                
                <button 
                  onClick={() => router.push('/admin/publish')} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Plus size={16}/>
                  <span>发布</span>
                </button>
                
                <button onClick={AuthService.logout} className="p-2.5 text-slate-400 hover:text-red-500 transition-all">
                  <Unlock size={20} />
                </button>
              </>
            ) : (
              <button onClick={AuthService.login} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-all">
                <Lock size={18} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 主体内容 */}
      <div className="max-w-6xl mx-auto px-8 pb-20 mt-12">
        {!isAdmin && (
          <section className="mb-16 py-10 border-b border-slate-50">
            <h2 className="text-5xl font-black mb-4 tracking-tight">Digital Garden.</h2>
            <p className="text-xl text-slate-400 font-medium italic">此处存放代码、灵感与生活。</p>
          </section>
        )}

        {/* 资产卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
          {assets
            .filter((a: any) => !['IMAGE', 'TOOL', 'LINK', 'EVENT'].includes(a.type))
            .map((asset: any) => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                isAdmin={isAdmin} 
                onAction={handleAction} 
              />
            ))}
        </div>
      </div>

      {/* 弹窗组件挂载 */}
      {showCalendar && (
        <CalendarGallery 
          assets={assets} 
          onClose={() => setShowCalendar(false)} 
          onDelete={(id: any) => handleAction('DELETE', `http://localhost:3000/assets/${id}`)}
        />
      )}
      
      {showGallery && (
        <ImageGallery 
          assets={assets} uploading={uploading} onClose={() => setShowGallery(false)} 
          onDelete={(id: any) => handleAction('DELETE', `http://localhost:3000/assets/${id}`)}
          onUpload={handleUpload}
          onInsert={(url: string) => { navigator.clipboard.writeText(url); alert("已复制链接"); }}
        />
      )}
      
      {showLinkGallery && (
        <LinkGallery 
          assets={assets} isAdmin={isAdmin} onClose={() => setShowLinkGallery(false)} 
          onDelete={(id: any) => handleAction('DELETE', `http://localhost:3000/assets/${id}`)}
          onAdd={(data: any) => handleAction('POST', 'http://localhost:3000/assets', data)}
        />
      )}
    </main>
  );
}
"use client";
import { useState, useEffect } from 'react';
import { AssetService } from '@/services/authService';
import { ImageGallery } from './ImageGallery';
import { LinkGallery } from './LinkGallery';
import { Globe, Loader2, Image as ImageLucide, Check, ChevronLeft, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export const AssetForm = ({ initialData, onSave, onCancel }: any) => {
  const [asset, setAsset] = useState({ title: '', content: '', type: 'BLOG' });
  const [allAssets, setAllAssets] = useState([]);
  const [showImages, setShowImages] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [uploading, setUploading] = useState(false);

  const markdownComponents: Record<string, any> = {
    p: (props: any) => <div className="mb-4">{props.children}</div>,
    drag: (props: any) => (
      <div className="my-4 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50">
        <p className="text-[10px] text-slate-400 mb-3 uppercase font-bold tracking-widest">互动组件预览模式</p>
        <img src={props.img} className="w-32 h-auto mx-auto grayscale opacity-50" alt="game preview" />
      </div>
    )
  };

  useEffect(() => {
    if (initialData) setAsset(initialData);
    fetchGalleryData();
  }, [initialData]);

  const fetchGalleryData = async () => {
    try {
      const data = await AssetService.fetchAssets(true);
      setAllAssets(data);
    } catch (err) { console.error("数据加载失败", err); }
  };

  const insertToContent = (text: string) => {
    setAsset(prev => ({ ...prev, content: prev.content + "\n" + text + "\n" }));
  };

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const cosData = await AssetService.upload(file);
      await AssetService.executeAction('POST', 'http://localhost:3000/assets', {
        type: 'IMAGE', title: file.name, content: cosData.url
      });
      insertToContent(`![${file.name}](${cosData.url})`);
      fetchGalleryData();
    } catch (err) { alert("上传失败"); } finally { setUploading(false); }
  };

  return (
    // ✅ 关键：整个表单作为独立全屏层，自身就是滚动容器
    // 彻底脱离外部 layout 的任何 overflow/height 限制
    <div className="fixed inset-0 z-40 bg-black/5 overflow-y-auto">

      {/* ✅ 导航栏改用 sticky，相对于上方可滚动容器吸顶，不再依赖视口 */}
      <div className="sticky top-0 z-50 px-6 py-4 bg-white/50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex items-center p-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex-1">
            <button
              type="button"
              onClick={onCancel}
              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1"
            >
              <ChevronLeft size={20} />
              <span className="font-bold text-sm">返回</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1 mr-2 border-r pr-4 border-slate-100">
              <button
                type="button"
                onClick={() => setShowLinks(true)}
                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all"
                title="工具库"
              >
                <Globe size={20} />
              </button>
              <button
                type="button"
                onClick={() => setShowImages(true)}
                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all"
                title="图片库"
              >
                <ImageLucide size={20} />
              </button>
            </div>

            <button
              onClick={() => onSave(
                initialData ? 'PUT' : 'POST',
                initialData ? `http://localhost:3000/assets/${initialData.id}` : 'http://localhost:3000/assets',
                asset
              )}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Check size={18} />
              <span>保存修改</span>
            </button>
          </div>
        </div>
      </div>

      {/* ✅ 内容区：pt 现在完全有效，因为父容器是自身的滚动上下文 */}
      <div className="pt-6 px-6 pb-20">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* 编辑区 */}
          <div
            className="flex flex-col space-y-4"
            style={{ height: 'calc(100vh - 7rem)' }}
          >
            {/* 标题行 */}
            <div className="flex gap-4 items-center shrink-0">
              <select
                className="px-4 py-2 bg-white rounded-xl border border-slate-200 font-bold text-sm outline-none focus:ring-2 ring-blue-50"
                value={asset.type}
                onChange={e => setAsset({ ...asset, type: e.target.value })}
              >
                <option value="BLOG">BLOG</option>
                <option value="PROJECT">PROJECT</option>
              </select>
              <input
                className="flex-1 text-2xl font-black outline-none border-b-2 border-transparent focus:border-blue-600 transition-all py-2 placeholder:text-slate-200"
                placeholder="在这里输入标题..."
                value={asset.title}
                onChange={e => setAsset({ ...asset, title: e.target.value })}
              />
            </div>

            {/* textarea 容器：min-h-0 允许 flex 子项收缩，触发内部滚动 */}
            <div className="relative flex-1 min-h-0 group shadow-sm rounded-[2.5rem] overflow-hidden border border-slate-100 bg-white">
              <textarea
                className="w-full h-full p-8 outline-none focus:bg-white transition-all resize-none font-mono text-sm leading-relaxed overflow-y-auto"
                placeholder="支持 Markdown 语法内容..."
                value={asset.content}
                onChange={e => setAsset({ ...asset, content: e.target.value })}
              />
              <label className="absolute bottom-6 right-6 cursor-pointer p-4 bg-white shadow-xl rounded-full text-slate-400 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all border border-slate-50">
                {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                <input type="file" className="hidden" accept="image/*" onChange={handleLocalUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* 预览区：sticky top 对应导航栏高度，内部独立滚动 */}
          <div
            className="sticky overflow-y-auto rounded-[2.5rem] border-2 border-slate-50 bg-white shadow-inner p-10"
            style={{ top: '5rem', height: 'calc(100vh - 7rem)' }}
          >
            <article className="prose prose-slate max-w-none">
              <h1 className="text-4xl font-black tracking-tighter mb-8 text-slate-900 border-b pb-4">
                {asset.title || '标题预览'}
              </h1>
              <div className="preview-content">
                <ReactMarkdown components={markdownComponents} rehypePlugins={[rehypeRaw]}>
                  {asset.content || '*请在左侧输入内容以查看预览...*'}
                </ReactMarkdown>
              </div>
            </article>
          </div>

        </div>
      </div>

      {/* 弹窗 */}
      {showImages && (
        <ImageGallery
          assets={allAssets}
          onClose={() => setShowImages(false)}
          onInsert={(url: string) => insertToContent(`![](${url})`)}
          onUpload={handleLocalUpload}
          uploading={uploading}
          onDelete={(id: any) =>
            AssetService.executeAction('DELETE', `http://localhost:3000/assets/${id}`).then(fetchGalleryData)
          }
        />
      )}

      {showLinks && (
        <LinkGallery
          assets={allAssets}
          isAdmin={true}
          onClose={() => setShowLinks(false)}
          onAdd={(data: any) =>
            AssetService.executeAction('POST', 'http://localhost:3000/assets', data).then(fetchGalleryData)
          }
          onDelete={(id: any) =>
            AssetService.executeAction('DELETE', `http://localhost:3000/assets/${id}`).then(fetchGalleryData)
          }
          onInsertLink={(title: string, url: string) => insertToContent(`[${title}](${url})`)}
        />
      )}
    </div>
  );
};
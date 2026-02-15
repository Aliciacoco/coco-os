"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react'; // 引入 Suspense
import { AssetForm } from '@/components/AssetForm';
import { AssetService, AuthService } from '@/services/authService';
import { Loader2 } from 'lucide-react';

// 1. 创建一个内部组件处理逻辑
function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!assetId);

  useEffect(() => {
    if (!AuthService.isLoggedIn()) { 
      router.push('/'); 
      return; 
    }
    if (assetId) {
      // 注意：建议这里也把 localhost 改为相对路径或环境变量，但在当前排查 build 阶段先保持原样
      fetch(`http://localhost:3000/assets/${assetId}`, { headers: AuthService.getAuthHeader() })
        .then(res => res.json())
        .then(data => { 
          setInitialData(data); 
          setLoading(false); 
        })
        .catch(() => { 
          alert("加载失败"); 
          router.push('/'); 
        });
    }
  }, [assetId, router]);

  const handleSave = async (method: string, url: string, body: any) => {
    try {
      await AssetService.executeAction(method, url, body);
      router.push('/');
    } catch (err) { 
      alert("操作失败"); 
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <AssetForm initialData={initialData} onSave={handleSave} onCancel={() => router.push('/')} />
    </div>
  );
}

// 2. 主导出组件，负责包裹 Suspense 边界
export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
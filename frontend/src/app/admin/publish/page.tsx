"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AssetForm } from '@/components/AssetForm';
import { AssetService, AuthService } from '@/services/authService';
import { Loader2 } from 'lucide-react';

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!assetId);

  useEffect(() => {
    if (!AuthService.isLoggedIn()) { router.push('/'); return; }
    if (assetId) {
      fetch(`http://localhost:3000/assets/${assetId}`, { headers: AuthService.getAuthHeader() })
        .then(res => res.json())
        .then(data => { setInitialData(data); setLoading(false); })
        .catch(() => { alert("加载失败"); router.push('/'); });
    }
  }, [assetId, router]);

  const handleSave = async (method: string, url: string, body: any) => {
    try {
      await AssetService.executeAction(method, url, body);
      router.push('/');
    } catch (err) { alert("操作失败"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="mx-auto">
      <AssetForm initialData={initialData} onSave={handleSave} onCancel={() => router.push('/')} />
    </div>
  );
}
// 统一管理所有的 API 调用逻辑

const BASE_URL = 'http://localhost:3000';

// 获取管理员密码
const getAdminPwd = () => typeof window !== 'undefined' ? localStorage.getItem('admin_pwd') : null;

// 通用请求封装
const apiRequest = async (endpoint: string, method = 'GET', body?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'x-admin-password': getAdminPwd() || ''
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  return res.json();
};

export const AssetService = {
  // 1. 获取资产列表
  getAssets: async (isAdmin: boolean) => {
    const endpoint = isAdmin ? '/assets' : '/public/assets';
    return apiRequest(endpoint);
  },

  // 2. 执行 CRUD 操作
  action: async (method: string, assetId?: number, body?: any) => {
    const endpoint = assetId ? `/assets/${assetId}` : '/assets';
    return apiRequest(endpoint, method, body);
  },

  // 3. 上传文件到 COS
  uploadToCos: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch(`${BASE_URL}/upload-cos`, {
      method: 'POST',
      headers: { 'x-admin-password': getAdminPwd() || '' },
      body: formData
    });
    return res.json();
  }
};
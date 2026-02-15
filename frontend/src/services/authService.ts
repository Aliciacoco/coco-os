/**
 * 身份验证服务封装
 */
export const AuthService = {
  // 获取存储的密码
  getAdminPwd: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_pwd');
    }
    return null;
  },

  // 检查是否已登录
  isLoggedIn: () => {
    return !!AuthService.getAdminPwd();
  },

  // 登录逻辑
  login: () => {
    const pwd = prompt("请输入管理员密码：");
    if (pwd) {
      localStorage.setItem('admin_pwd', pwd);
      window.location.reload();
      return true;
    }
    return false;
  },

  // 退出逻辑
  logout: () => {
    localStorage.removeItem('admin_pwd');
    window.location.reload();
  },

  // 统一请求头封装
  getAuthHeader: () => {
    return {
      'x-admin-password': AuthService.getAdminPwd() || '',
      'Content-Type': 'application/json'
    };
  }
};

/**
 * 资产 API 服务封装 (合并了之前的 assetService)
 */
const BASE_URL = 'http://localhost:3000';

export const AssetService = {
  // 获取列表
  fetchAssets: async (isAdmin: boolean) => {
    const endpoint = isAdmin ? '/assets' : '/public/assets';
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: AuthService.getAuthHeader()
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    return res.json();
  },

  // 执行通用操作 (POST/PATCH/DELETE)
  // src/services/authService.ts

executeAction: async (method: string, endpoint: string, body?: any) => {
  const res = await fetch(endpoint, {
    method,
    headers: AuthService.getAuthHeader(),
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  
  // ✨ 修复关键：如果状态码是 204 (No Content) 或响应头显示没有内容，直接返回 null 或空对象
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null; 
  }

  // 只有在有内容的情况下才解析 JSON
  return res.json();
},

  // 文件上传
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch(`${BASE_URL}/upload-cos`, {
      method: 'POST',
      headers: { 'x-admin-password': AuthService.getAdminPwd() || '' },
      body: formData
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    return res.json();
  }
};
import express from 'express';
import { PrismaClient } from '@prisma/client';
import "dotenv/config";
import cors from 'cors';
import COS from 'cos-nodejs-sdk-v5';
import multer from 'multer';
// 🚀 注意：既然你已经单独写了 omniRouter，这里不再需要重复导入 OpenAI
import omniRouter from './api/ai/omni'; 

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. 配置区域 ---
const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID, 
  SecretKey: process.env.TENCENT_SECRET_KEY,
});

const BUCKET = process.env.TENCENT_BUCKET || ''; 
const REGION = process.env.TENCENT_REGION || '';

app.use(cors());
app.use(express.json());

// 🚀 核心挂载：将 AI 解析路由挂载到 /api/ai
// 这样你在独立文件 omni.ts 里的修改会直接生效
app.use('/api/ai', omniRouter);

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- 2. 安全锁中间件 ---
const authMiddleware = (req: any, res: any, next: any) => {
  // 保持与前端一致的 Header 名称：x-admin-password
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: '权限不足，请输入管理员密码' });
  }
};

// --- 3. 路由定义 ---

// [公开] 访客主页列表
app.get('/public/assets', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { published: true, type: { not: 'IMAGE' } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: '无法获取公开内容' });
  }
});

// [公开] 获取单个详情
app.get('/assets/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const asset = await prisma.asset.findUnique({ where: { id: parseInt(id) } });
    if (!asset) return res.status(404).json({ error: '资产不存在' });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// [私密] 管理后台获取所有列表
app.get('/assets', authMiddleware, async (req: any, res: any) => {
  try {
    const assets = await prisma.asset.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: '无法读取资产列表' });
  }
});

// [加锁] 图片上传
app.post('/upload-cos', authMiddleware, upload.single('image'), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: '请选择图片' });
  const fileName = `assets/${Date.now()}-${req.file.originalname}`;
  cos.putObject({
    Bucket: BUCKET, Region: REGION, Key: fileName, Body: req.file.buffer,
  }, (err, data) => {
    if (err) return res.status(500).json({ error: '上传失败' });
    res.json({ url: `https://${data.Location}`, cosKey: fileName });
  });
});

// [加锁] 创建资产 (手动添加工具/日程的入口)
app.post('/assets', authMiddleware, async (req: any, res: any) => {
  const { type, title, content, tags, metadata, published } = req.body;
  try {
    const newAsset = await prisma.asset.create({
      data: {
        // 🚀 核心修复：将之前的 'link' 修改为大写 'LINK'，确保与 AI 逻辑和前端逻辑完全统一
        type: type || 'LINK', 
        title: title || '未命名',
        content: content || '',
        tags: tags || [],
        metadata: metadata || {},
        published: published || false
      },
    });
    res.status(201).json(newAsset);
  } catch (error) {
    res.status(500).json({ error: '创建失败' });
  }
});

// [加锁] 更新资产
app.put('/assets/:id', authMiddleware, async (req: any, res: any) => {
  const { id } = req.params;
  const { title, content, type, metadata, published } = req.body;
  try {
    const updated = await prisma.asset.update({
      where: { id: parseInt(id) },
      data: { title, content, type, metadata: metadata || {}, published },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "更新失败" });
  }
});

// [加锁] 删除资产
app.delete('/assets/:id', authMiddleware, async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const asset = await prisma.asset.findUnique({ where: { id: parseInt(id) } });
    if (asset?.type === 'IMAGE' && (asset.metadata as any)?.cosKey) {
      await new Promise((resolve, reject) => {
        cos.deleteObject({
          Bucket: BUCKET, Region: REGION, Key: (asset.metadata as any).cosKey
        }, (err, data) => err ? reject(err) : resolve(data));
      });
    }
    await prisma.asset.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

// 🚀 移除原本写在 app.ts 里的 app.post('/api/ai/omni')，
// 因为我们已经在上面通过 app.use('/api/ai', omniRouter) 挂载了 omni.ts。
// 这样你只需在 omni.ts 中维护 AI 逻辑，代码更整洁。

app.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
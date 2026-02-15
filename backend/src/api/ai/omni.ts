import { Router } from 'express';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const prisma = new PrismaClient();

const ds = new OpenAI({ 
    baseURL: 'https://api.deepseek.com', 
    apiKey: process.env.DEEPSEEK_API_KEY
});

router.post('/', async (req: any, res: any) => {
    const { command } = req.body;

    if (!command) {
        return res.status(400).json({ error: "指令不能为空" });
    }

    let completion: any = null;

    try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. 调用 DeepSeek 解析：明确三选一指令
        completion = await ds.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { 
                    role: "system", 
                    content: `你是一个高效助理。当前日期是 ${today}。
                    请解析指令并严格返回 JSON 格式。
                    
                    意图分类（三选一）：
                    - LINK: 网址、工具、网页收藏
                    - EVENT: 日程、提醒、待办
                    - BLOG: 笔记、灵感、长文

                    返回 JSON 结构：
                    {
                      "type": "LINK" | "EVENT" | "BLOG",
                      "data": {
                        "title": "标题",
                        "date": "YYYY-MM-DD (仅EVENT需要)",
                        "url": "网址 (仅LINK需要)",
                        "content": "内容 (仅BLOG需要)"
                      }
                    }`
                },
                { role: "user", content: command }
            ],
            // @ts-ignore
            response_format: { type: 'json_object' }
        });

        const rawContent = completion.choices[0].message.content || '{}';
        const cleanJsonString = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiResult = JSON.parse(cleanJsonString);

        // 2. 核心存储逻辑：根据 type 自动对齐 content 字段
        const newAsset = await prisma.asset.create({
            data: {
                type: aiResult.type || 'LINK',
                title: aiResult.data?.title || '未命名记录',
                // 🚀 逻辑自适应：LINK 取 url，其余取 content
                content: aiResult.type === 'LINK' ? (aiResult.data?.url || "") : (aiResult.data?.content || ""),
                metadata: aiResult.data || {}, 
                published: aiResult.type === 'LINK' // 链接类默认公开，方便工具库渲染
            }
        });

        console.log(`✅ AI 解析成功: [${newAsset.type}] ${newAsset.title}`);
        res.status(201).json(newAsset);

    } catch (error: any) {
        console.error('❌ AI 处理失败:', error.message);
        res.status(500).json({ error: "AI 处理失败" });
    }
});

export default router;
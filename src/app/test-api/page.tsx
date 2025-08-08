"use client";

import { useState } from 'react';

// 将环境变量提升到模块作用域并声明类型
const OPENROUTER_API_KEY: string | undefined = process.env.OPENAI_API_KEY;
const YOUR_SITE_URL: string | undefined = process.env.SITE_URL;
const YOUR_SITE_NAME: string | undefined = process.env.SITE_NAME;

export default function APITestPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      if (!OPENROUTER_API_KEY) {
        throw new Error('API密钥未配置');
      }

      const testResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': YOUR_SITE_URL || 'http://localhost:3000',
          'X-Title': YOUR_SITE_NAME || '购房助手',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'moonshotai/kimi-k2:free',
          messages: [
            { role: 'system', content: '你是一位测试助手，请回复"测试成功"' },
            { role: 'user', content: '这是一条测试消息' }
          ]
        }),
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        throw new Error(`API错误 (${testResponse.status}): ${errorData.error?.message || '未知错误'}`);
      }

      const data = await testResponse.json();
      setResponse(JSON.stringify(data, null, 2));
      console.log('API测试成功:', data);
    } catch (err) {
      console.error('API测试失败:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('发生未知错误');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API连通性测试</h1>
      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? '测试中...' : '运行API测试'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <h2 className="font-bold">错误信息</h2>
          <pre>{error}</pre>
        </div>
      )}

      {response && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">API响应</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">{response}</pre>
        </div>
      )}
    </div>
  );
}
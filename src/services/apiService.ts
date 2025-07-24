import { EvaluationScores } from "./evaluationService";
import { 
  locationCriteria,
  conditionCriteria,
  buildingAgeCriteria,
  layoutCriteria,
  surroundingCriteria
} from "../constants/evaluationCriteria";

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const YOUR_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const YOUR_SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME;
const YOUR_MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME;

export async function getAIScores(
  community: string,
  district: string,
  layout: string
): Promise<EvaluationScores> {
  
  // 确保API密钥存在
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API密钥未配置");
  }

  // 添加重试机制处理速率限制
  const retries = 3;
  let delay = 1000; // 初始延迟1秒
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // 构建系统提示
      const systemPrompt = `你是一位专业的房产评估师。请根据提供的信息，按照以下评分规则进行专业评估：
        
      ## 地理位置评分规则
      ${locationCriteria.map(c => `- ${c.label}: ${c.min}-${c.max}分`).join('\n')}
        
      ## 房屋状况评分规则
      ${conditionCriteria.map(c => `- ${c.label}: ${c.min}-${c.max}分`).join('\n')}
        
      ## 楼龄评分规则
      ${buildingAgeCriteria.map(c => `- ${c.label}: ${c.min}-${c.max}分`).join('\n')}
        
      ## 户型与朝向评分规则
      ${layoutCriteria.map(c => `- ${c.label}: ${c.min}-${c.max}分`).join('\n')}
        
      ## 周边配套评分规则
      ${surroundingCriteria.map(c => `- ${c.label}: ${c.min}-${c.max}分`).join('\n')}
        
      请严格遵循以下要求：
      1. 只返回JSON格式数据，不要包含任何额外文本
      2. 使用以下字段结构：
      {
        "locationScores": { ... },
        "conditionScores": { ... },
        "buildingAgeScores": { ... },
        "layoutScores": { ... },
        "surroundingScores": { ... }
      }
      3. 每个字段的值应为包含具体评分项的对象`;

      const userPrompt = `评估宁波市${district}的${community}小区，户型描述：${layout}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': YOUR_SITE_URL || 'http://localhost:3000',
          'X-Title': YOUR_SITE_NAME || 'Local Dev App', // Must be ISO-8859-1 characters
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: YOUR_MODEL_NAME || 'deepseek/deepseek-r1-0528:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `API请求失败:
          URL: ${response.url}
          状态码: ${response.status}
          响应体: ${errorBody}`;
          
        // 添加针对429错误的特殊提示
        if (response.status === 429) {
          errorMessage += `\n\n提示：您已达到API速率限制。请考虑设置您自己的OpenRouter API密钥以避免公共速率限制。详情请参考：https://openrouter.ai/settings/integrations`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('API返回内容为空');
      }

      // 添加响应验证和日志
      console.log('[DEBUG] API原始响应:', content);
      const parsedContent = JSON.parse(content);
      
      // 直接使用API返回的字段结构，无需转换
      const normalizedContent = parsedContent;
      
      // 验证必需字段
      const requiredKeys = [
        'locationScores',
        'conditionScores',
        'buildingAgeScores',
        'layoutScores',
        'surroundingScores'
      ];
      
      for (const key of requiredKeys) {
        if (!(key in normalizedContent)) {
          console.error(`[ERROR] API响应缺少必需字段: ${key}`);
          throw new Error(`API响应缺少必需字段: ${key}`);
        }
      }
      
      console.log('[DEBUG] 标准化后的评分数据:', JSON.stringify(normalizedContent));
      return normalizedContent;
    } catch (error) {
      lastError = error;
      console.error(`API请求失败(尝试 ${attempt + 1}/${retries}):`, error);
      
      // 如果是429错误且还有重试次数，则等待后重试
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('429') && attempt < retries - 1) {
        console.log(`等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // 指数退避
      } else {
        break; // 其他错误或重试次数用尽
      }
    }
  }
  
  // 所有重试失败后抛出错误
  console.error('所有重试失败:', lastError);
  throw lastError || new Error('API请求失败');
}
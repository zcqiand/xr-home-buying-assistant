import { EvaluationScores } from "./evaluationService";

interface ProsCons {
  pros: string[];
  cons: string[];
}
import { evaluationConfig } from "../constants/evaluationCriteria";

export async function getAIScores(
  city: string,
  community: string,
  district: string,
  floor: string,
  direction: string,
  renovation: string,
  layout: string,
  additionalDesc: string,
  config: {
    apiKey: string | undefined;
    siteUrl: string;
    siteName: string;
    modelName: string;
  }
): Promise<EvaluationScores & { prosCons: ProsCons }> {
  console.log('[DEBUG] getAIScores接收到的参数:', { city, community, district, floor, direction, renovation, layout, additionalDesc });
  
  // 确保API密钥存在
  if (!config.apiKey) {
    throw new Error("OpenRouter API密钥未配置");
  }

  
  let lastError = null;
    try {
      // 构建系统提示
      const systemPrompt = `你是一位专业的房产评估师。请根据提供的信息，按照以下评分规则进行专业评估：
        
      ## 地理位置评分规则
      ${Object.entries(evaluationConfig.location).map(([group, items]) =>
        `- 【${group}】\n${items.map(item => `    ${item.id}.${item.label}: ${item.min}-${item.max}分`).join('\n')}`
      ).join('\n')}
        
      ## 房屋状况评分规则
      ${Object.entries(evaluationConfig.condition).map(([group, items]) =>
        `- 【${group}】\n${items.map(item => `    ${item.id}.${item.label}: ${item.min}-${item.max}分`).join('\n')}`
      ).join('\n')}
        
      ## 楼龄评分规则
      ${Object.entries(evaluationConfig.buildingAge).map(([group, items]) =>
        `- 【${group}】\n${items.map(item => `    ${item.id}.${item.label}: ${item.min}-${item.max}分`).join('\n')}`
      ).join('\n')}
        
      ## 户型与朝向评分规则
      ${Object.entries(evaluationConfig.layout).map(([group, items]) =>
        `- 【${group}】\n${items.map(item => `    ${item.id}.${item.label}: ${item.min}-${item.max}分`).join('\n')}`
      ).join('\n')}
        
      ## 周边配套评分规则
      ${Object.entries(evaluationConfig.surrounding).map(([group, items]) =>
        `- 【${group}】\n${items.map(item => `    ${item.id}.${item.label}: ${item.min}-${item.max}分`).join('\n')}`
      ).join('\n')}
      
      ## 重要定义
      - 组别：指评分规则中用方括号【】标识的字符，如【商业】、【景观】、【交通】等

      请严格遵循以下要求：
      0. 每个评分规则组别必须有且仅有一个评分项
      1. 只返回JSON格式数据，不要包含任何额外文本或解释
      2. 使用以下字段结构：
     {
       "locationScores": { 
        [{"[规则ID].[规则描述] [分数范围]": [实际分数]}, ...],
        // 示例: [{"B1.区域性商业中心 20-25": 22}, ...]
      },
       "conditionScores": { ... },
       "buildingAgeScores": { ... },
       "layoutScores": { ... },
       "surroundingScores": { ... },
       "prosCons": {
         "pros": ["优点1", "优点2"],
         "cons": ["缺点1", "缺点2"]
       }
     }
      3. 每个字段的值应为包含具体评分项的对象
      
      请评估${city}${district}的${community}小区，楼层${floor}，朝向${direction}，${renovation}装修，户型${layout}，补充描述：${additionalDesc}`;
      
      // 调试日志：验证提示词内容
      console.log('[DEBUG] 系统提示词:', systemPrompt);

      const userPrompt = `评估${city}${district}的${community}小区，楼层${floor}，朝向${direction}，${renovation}装修，户型${layout}，补充描述：${additionalDesc}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'HTTP-Referer': config.siteUrl,
          'X-Title': config.siteName,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const errorMessage = `API请求失败:
          URL: ${response.url}
          状态码: ${response.status}
          响应体: ${errorBody}`;
        
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
      
      // 添加调试日志，检查API返回的数据格式
      console.log('[DEBUG] 解析后的数据:', JSON.stringify(parsedContent, null, 2));
      console.log('[DEBUG] locationScores类型:', typeof parsedContent.locationScores);
      console.log('[DEBUG] locationScores是否为数组:', Array.isArray(parsedContent.locationScores));
      if (parsedContent.locationScores) {
        console.log('[DEBUG] locationScores内容:', JSON.stringify(parsedContent.locationScores));
      }
      
      // 验证必需字段
      const requiredKeys = [
        'locationScores',
        'conditionScores',
        'buildingAgeScores',
        'layoutScores',
        'surroundingScores',
        'prosCons'
      ];
      
      for (const key of requiredKeys) {
        if (!(key in normalizedContent)) {
          console.error(`[ERROR] API响应缺少必需字段: ${key}`);
          throw new Error(`API响应缺少必需字段: ${key}`);
        }
      }
      
      // 在 return normalizedContent; 之前添加数据转换逻辑
      const convertScoresFormat = (scores: Record<string, number>[]) => {
        return scores.reduce((acc, item) => {
          const [key, value] = Object.entries(item)[0];
          return { ...acc, [key]: value };
        }, {});
      };

      // 转换所有评分数据格式
      const finalContent = {
        ...normalizedContent,
        locationScores: convertScoresFormat(normalizedContent.locationScores),
        conditionScores: convertScoresFormat(normalizedContent.conditionScores),
        buildingAgeScores: convertScoresFormat(normalizedContent.buildingAgeScores),
        layoutScores: convertScoresFormat(normalizedContent.layoutScores),
        surroundingScores: convertScoresFormat(normalizedContent.surroundingScores)
      };

      console.log('[DEBUG] 转换后的评分数据:', JSON.stringify(finalContent));
      return finalContent;


    } catch (error) {
      lastError = error;
      console.error(`API请求失败:`, error);
      throw lastError || new Error('API请求失败');
    }
}
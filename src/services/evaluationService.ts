// 评估分数类型定义
export interface EvaluationScores {
  locationScores: Record<string, number>;
  conditionScores: Record<string, number>;
  buildingAgeScores: Record<string, number>;
  layoutScores: Record<string, number>;
  surroundingScores: Record<string, number>;
}

// 实现3.1.1评估模型
export function calculatePropertyEvaluation(
  scores: EvaluationScores,
  district: string
): {
  totalScore: number;
  pricePerSqM: number;
  detailedScores: {
    locationTotal: number;
    conditionTotal: number;
    buildingAgeTotal: number;
    layoutTotal: number;
    surroundingTotal: number;
    locationScores: Record<string, number>;
    conditionScores: Record<string, number>;
    buildingAgeScores: Record<string, number>;
    layoutScores: Record<string, number>;
    surroundingScores: Record<string, number>;
  }
} {
  const {
    locationScores,
    conditionScores,
    buildingAgeScores,
    layoutScores,
    surroundingScores
  } = scores;
  // 基准房价数据
  const BASE_PRICES: Record<string, number> = {
    "yinzhou": 35000,  // 鄞州区
    "haishu": 32000,   // 海曙区
    "jiangbei": 28000, // 江北区
    "zhenhai": 25000,  // 镇海区
    "beilun": 23000,   // 北仑区
    "fenghua": 18000   // 奉化区
  };

  const basePrice = BASE_PRICES[district] || 25000;
  
  // 定义权重系数
  const WEIGHTS = {
    location: 0.35,
    condition: 0.25,
    buildingAge: 0.15,
    layout: 0.10,
    surrounding: 0.10
  };
  
  // 添加防御性检查和日志
  console.log('[DEBUG] 计算函数输入:', scores);
  
  // 验证必需字段
  const requiredKeys = ['locationScores', 'conditionScores', 'buildingAgeScores', 'layoutScores', 'surroundingScores'];
  for (const key of requiredKeys) {
    if (!scores[key as keyof EvaluationScores]) {
      console.error(`[ERROR] 评估数据缺少必需字段: ${key}`);
      throw new Error(`评估数据缺少必需字段: ${key}`);
    }
  }

  // 计算各大项总分（各细化项目分数之和）
  const locationTotal = Object.values(locationScores!).reduce((sum, score) => sum + score, 0);
  const conditionTotal = Object.values(conditionScores!).reduce((sum, score) => sum + score, 0);
  const buildingAgeTotal = Object.values(buildingAgeScores!).reduce((sum, score) => sum + score, 0);
  const layoutTotal = Object.values(layoutScores!).reduce((sum, score) => sum + score, 0);
  const surroundingTotal = Object.values(surroundingScores!).reduce((sum, score) => sum + score, 0);
  
  // 计算加权总分
  const totalScore = Math.floor(
    locationTotal * WEIGHTS.location +
    conditionTotal * WEIGHTS.condition +
    buildingAgeTotal * WEIGHTS.buildingAge +
    layoutTotal * WEIGHTS.layout +
    surroundingTotal * WEIGHTS.surrounding
  );
  
  // 计算预估单价 = 基准房价 × (加权总分 / 100)
  const pricePerSqM = Math.floor(basePrice * (totalScore / 100));
  
  return {
    totalScore,
    pricePerSqM,
    detailedScores: {
      locationTotal,
      conditionTotal,
      buildingAgeTotal,
      layoutTotal,
      surroundingTotal,
      locationScores,
      conditionScores,
      buildingAgeScores,
      layoutScores,
      surroundingScores
    }
  };
}

// 计算总价
export function calculateTotalPrice(pricePerSqM: number, area: number): number {
  return Math.floor(pricePerSqM * area);
}
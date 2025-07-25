import { NextRequest, NextResponse } from 'next/server'
import { getAIScores } from '@/services/apiService'

export async function POST(req: NextRequest) {
  try {
    const { city, community, district, layout, floor, direction, renovation, additionalDesc } = await req.json()
    console.log('[DEBUG] API接收到的参数:', { city, community, district, layout, floor, direction, renovation, additionalDesc });
    
    // 从环境变量获取配置（服务器端安全）
    const config: {
      apiKey: string | undefined;
      siteUrl: string;
      siteName: string;
      modelName: string;
    } = {
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Home Buying Assistant',
      modelName: process.env.NEXT_PUBLIC_MODEL_NAME || 'deepseek/deepseek-r1-0528:free'
    }

    if (!config.apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    const result = await getAIScores(city, community, district, floor, direction, renovation, layout, additionalDesc, config)
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('API evaluation error:', error)
    let errorMessage = 'Evaluation failed'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message)
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { calculatePropertyEvaluation, calculateTotalPrice } from "@/services/evaluationService";
import { getAIScores } from "@/services/apiService";

const cities = [
  { id: "ningbo", name: "宁波市" },
];

const districts = [
  { id: "yinzhou", name: "鄞州区" },
  { id: "haishu", name: "海曙区" },
  { id: "jiangbei", name: "江北区" },
  { id: "zhenhai", name: "镇海区" },
  { id: "beilun", name: "北仑区" },
  { id: "fenghua", name: "奉化区" },
];

export default function EvaluationForm() {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [community, setCommunity] = useState("");
  const [area, setArea] = useState<number | string>("");
  const [layout, setLayout] = useState("");
  
  const [result, setResult] = useState<{
    totalScore: number;
    pricePerSqM: number;
    totalPrice: number;
    detailedScores?: {
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
  } | null>(null);
  
  const [showDetails, setShowDetails] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证基本字段
    if (!city || !district || !area || !community || !layout) {
      setError("请填写所有必填字段");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const areaValue = typeof area === 'string' ? parseFloat(area) : area;
      
      // 调用AI获取评分
      const scores = await getAIScores(community, district, layout);
      
      const { totalScore, pricePerSqM, detailedScores } = calculatePropertyEvaluation(
        scores,
        district
      );
      
      const totalPrice = calculateTotalPrice(pricePerSqM, areaValue);
      
      setResult({
        totalScore,
        pricePerSqM,
        totalPrice,
        detailedScores
      });
    } catch (err: unknown) {
      console.error("评估失败:", err);
      let errorMessage = "评估失败，请稍后再试";
      
      if (err instanceof Error) {
        if (err.message.includes('429')) {
          errorMessage = "请求过于频繁，请等待1分钟后重试";
        } else if (err.message.includes('API密钥')) {
          errorMessage = "API配置错误，请联系管理员";
        } else if (err.message.includes('必需字段')) {
          errorMessage = "评估数据不完整，请检查输入";
        }
      } else {
        errorMessage = `未知错误: ${String(err)}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setCity("");
    setDistrict("");
    setCommunity("");
    setArea("");
    setLayout("");
    setResult(null);
    setError("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-red-500 p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="city">城市</Label>
            <Select onValueChange={setCity} value={city}>
              <SelectTrigger>
                <SelectValue placeholder="选择城市" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="district">区域板块</Label>
            <Select onValueChange={setDistrict} value={district}>
              <SelectTrigger>
                <SelectValue placeholder="选择区域" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="community">小区名称</Label>
            <Input
              id="community"
              value={community}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommunity(e.target.value)}
              placeholder="输入小区名称"
            />
          </div>

          <div>
            <Label htmlFor="area">房源面积 (平方米)</Label>
            <Input
              id="area"
              type="number"
              value={area}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArea(e.target.value)}
              placeholder="输入房源面积"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="layout">户型描述</Label>
            <Input
              id="layout"
              value={layout}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLayout(e.target.value)}
              placeholder="例如：3室2厅2卫"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "评估中..." : "评估房源"}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={resetForm}
            className="w-full"
          >
            重置
          </Button>
        </div>
      </form>
    
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>评估结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>综合评分</Label>
                <div className="text-2xl font-bold text-primary">
                  {result.totalScore} / 100
                </div>
              </div>
              <div>
                <Label>预估单价</Label>
                <div className="text-xl">
                  {result.pricePerSqM.toLocaleString()} 元/平方米
                </div>
              </div>
              <div>
                <Label>预估总价</Label>
                <div className="text-2xl font-bold text-green-600">
                  {(result.totalPrice / 10000).toLocaleString()} 万元
                </div>
              </div>
              {community && (
                <div className="text-sm text-muted-foreground">
                  小区: {community}
                </div>
              )}
              {layout && (
                <div className="text-sm text-muted-foreground">
                  户型: {layout}
                </div>
              )}
            </div>
            {result.detailedScores && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full"
                >
                  {showDetails ? "隐藏评估明细" : "查看评估明细"}
                </Button>
                {showDetails && (
                  <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold mb-2">评估明细</h4>
                    <ul className="space-y-1">
                      <li><span className="font-medium">区位因素:</span> {result.detailedScores.locationTotal.toFixed(2)} 分</li>
                      {Object.entries(result.detailedScores.locationScores).map(([key, value]) => (
                        <li key={key} className="ml-4 text-sm text-gray-600">- {key}: {value.toFixed(2)} 分</li>
                      ))}
                      <li><span className="font-medium">房源状况:</span> {result.detailedScores.conditionTotal.toFixed(2)} 分</li>
                      {Object.entries(result.detailedScores.conditionScores).map(([key, value]) => (
                        <li key={key} className="ml-4 text-sm text-gray-600">- {key}: {value.toFixed(2)} 分</li>
                      ))}
                      <li><span className="font-medium">建筑年代:</span> {result.detailedScores.buildingAgeTotal.toFixed(2)} 分</li>
                      {Object.entries(result.detailedScores.buildingAgeScores).map(([key, value]) => (
                        <li key={key} className="ml-4 text-sm text-gray-600">- {key}: {value.toFixed(2)} 分</li>
                      ))}
                      <li><span className="font-medium">户型结构:</span> {result.detailedScores.layoutTotal.toFixed(2)} 分</li>
                      {Object.entries(result.detailedScores.layoutScores).map(([key, value]) => (
                        <li key={key} className="ml-4 text-sm text-gray-600">- {key}: {value.toFixed(2)} 分</li>
                      ))}
                      <li><span className="font-medium">周边配套:</span> {result.detailedScores.surroundingTotal.toFixed(2)} 分</li>
                      {Object.entries(result.detailedScores.surroundingScores).map(([key, value]) => (
                        <li key={key} className="ml-4 text-sm text-gray-600">- {key}: {value.toFixed(2)} 分</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
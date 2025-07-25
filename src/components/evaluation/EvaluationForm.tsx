"use client";

import { useState, useEffect } from "react";
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
// 移除客户端直接调用

const cities = [
  { id: "宁波市", name: "宁波市" },
];

const districts = [
  { id: "鄞州区", name: "鄞州区", basePrice: 25554 },
  { id: "海曙区", name: "海曙区", basePrice: 20141 },
  { id: "江北区", name: "江北区", basePrice: 22879 },
  { id: "镇海区", name: "镇海区", basePrice: 25000 },
  { id: "北仑区", name: "北仑区", basePrice: 14715 },
  { id: "奉化区", name: "奉化区", basePrice: 17831 },
];

export default function EvaluationForm() {
  const [city, setCity] = useState("宁波市");
  const [district, setDistrict] = useState("");
  const [basePrice, setBasePrice] = useState<number | string>("");
  const [community, setCommunity] = useState("");
  const [area, setArea] = useState<number | string>("");
  const [layout, setLayout] = useState("3室2厅1卫");
  const [floorCurrent, setFloorCurrent] = useState<number | string>("");
  const [floorTotal, setFloorTotal] = useState<number | string>("");
  const [direction, setDirection] = useState("2南向卧室+1南向客厅+1北向卧室+西向厨房+北向卫生间");
  const [decoration, setDecoration] = useState("");
  const [additionalDesc, setAdditionalDesc] = useState("");
  
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
    };
    prosCons?: {
      pros: string[];
      cons: string[];
    };
  } | null>(null);
  
  const [showDetails, setShowDetails] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // 当基准房价或面积变化时，重新计算预估单价和总价
  useEffect(() => {
    if (result && result.detailedScores && basePrice !== "" && area !== "") {
      const basePriceValue = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
      const areaValue = typeof area === 'string' ? parseFloat(area) : area;
      
      // 重新计算预估单价和总价
      const { pricePerSqM } = calculatePropertyEvaluation(
        {
          locationScores: result.detailedScores.locationScores,
          conditionScores: result.detailedScores.conditionScores,
          buildingAgeScores: result.detailedScores.buildingAgeScores,
          layoutScores: result.detailedScores.layoutScores,
          surroundingScores: result.detailedScores.surroundingScores
        },
        basePriceValue
      );
      
      const totalPrice = calculateTotalPrice(pricePerSqM, areaValue);
      
      // 更新结果状态
      setResult({
        ...result,
        pricePerSqM,
        totalPrice
      });
    }
  }, [basePrice, area]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证基本字段
    if (!city || !district || !basePrice || !area || !community || !layout || !floorCurrent || !floorTotal || !direction || !decoration) {
      setError("请填写所有必填字段");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const areaValue = typeof area === 'string' ? parseFloat(area) : area;
      
      // 调用AI获取评分
      // 调用服务器端API
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          community,
          district,
          layout,
          floor: `${floorCurrent}/${floorTotal}`, // 组合楼层信息
          direction, // 朝向
          renovation: decoration, // 装修程度
          additionalDesc
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '评估请求失败');
      }
      
      const scores = await response.json();
      
      const basePriceValue = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
      const { totalScore, pricePerSqM, detailedScores } = calculatePropertyEvaluation(
        scores,
        basePriceValue
      );
      
      const totalPrice = calculateTotalPrice(pricePerSqM, areaValue);
      
      console.log('AI返回的prosCons数据:', scores.prosCons); // 调试日志
      console.log('AI返回的prosCons数据:', scores.prosCons); // 调试日志
      setResult({
        totalScore,
        pricePerSqM,
        totalPrice,
        detailedScores,
        prosCons: scores.prosCons
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
    setCity("宁波市");
    setDistrict("");
    setBasePrice("");
    setCommunity("");
    setArea("");
    setLayout("3室2厅1卫");
    setFloorCurrent("");
    setFloorTotal("");
    setDirection("2南向卧室+1南向客厅+1北向卧室+西向厨房+北向卫生间");
    setDecoration("");
    setAdditionalDesc("");
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
            <Select
              onValueChange={(value) => {
                setDistrict(value);
                // 设置选中区域的默认基准房价
                const selectedDistrict = districts.find(d => d.id === value);
                if (selectedDistrict) {
                  setBasePrice(selectedDistrict.basePrice.toString());
                }
              }}
              value={district}
            >
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
            <Label htmlFor="basePrice">基准房价 (元/平方米)</Label>
            <Input
              id="basePrice"
              type="number"
              value={basePrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBasePrice(e.target.value)}
              placeholder="输入基准房价"
              min="1"
            />
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
            <Label htmlFor="area">面积 (平方米)</Label>
            <Input
              id="area"
              type="number"
              value={area}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArea(e.target.value)}
              placeholder="输入面积"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="layout">户型</Label>
            <Input
              id="layout"
              value={layout}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLayout(e.target.value)}
              placeholder="例如：3室2厅2卫"
            />
          </div>

          <div>
            <Label htmlFor="floorCurrent">当前楼层</Label>
            <Input
              id="floorCurrent"
              type="number"
              value={floorCurrent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFloorCurrent(e.target.value)}
              placeholder="输入当前楼层"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="floorTotal">总楼层</Label>
            <Input
              id="floorTotal"
              type="number"
              value={floorTotal}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFloorTotal(e.target.value)}
              placeholder="输入总楼层"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="direction">朝向</Label>
            <Input
              id="direction"
              value={direction}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDirection(e.target.value)}
              placeholder="例如：3房朝南"
            />
          </div>

          <div>
            <Label htmlFor="decoration">装修程度</Label>
            <Select onValueChange={setDecoration} value={decoration}>
              <SelectTrigger>
                <SelectValue placeholder="选择装修程度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="毛坯">毛坯</SelectItem>
                <SelectItem value="简装">简装</SelectItem>
                <SelectItem value="精装">精装</SelectItem>
                <SelectItem value="豪装">豪装</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="additionalDesc">补充描述</Label>
            <Input
              id="additionalDesc"
              value={additionalDesc}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdditionalDesc(e.target.value)}
              placeholder="输入补充描述"
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
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                {community && <div>小区: {community}</div>}
                {layout && <div>户型: {layout}</div>}
                {floorCurrent && <div>当前楼层: {floorCurrent}</div>}
                {floorTotal && <div>总楼层: {floorTotal}</div>}
                {direction && <div>朝向: {direction}</div>}
                {decoration && <div>装修程度: {
                  decoration === "毛坯" ? "毛坯" :
                  decoration === "简装" ? "简装" :
                  decoration === "精装" ? "精装" : "豪装"
                }</div>}
              </div>
              {additionalDesc && (
                <div className="text-sm text-muted-foreground">
                  补充描述: {additionalDesc}
                </div>
              )}
            </div>            
            {result.prosCons && (result.prosCons.pros.length > 0 || result.prosCons.cons.length > 0) && (
              <div className="mt-4 border rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold mb-2">房源点评</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-green-600">优点：</h5>
                    <ul className="list-disc pl-5">
                      {result.prosCons.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-600">缺点：</h5>
                    <ul className="list-disc pl-5">
                      {result.prosCons.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
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
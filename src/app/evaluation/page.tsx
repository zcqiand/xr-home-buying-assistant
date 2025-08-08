import EvaluationForm from "@/components/evaluation/EvaluationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EvaluationPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>购房助手 / 房屋估价</CardTitle>
        </CardHeader>
        <CardContent>
          <EvaluationForm />
        </CardContent>
      </Card>
    </div>
  );
}
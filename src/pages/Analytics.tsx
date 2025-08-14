import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="container mx-auto py-8 px-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Mastery Radar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              A radar chart showing mastery per unit will be displayed here.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accuracy vs. Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              A time-series chart for accuracy vs. difficulty will be displayed
              here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

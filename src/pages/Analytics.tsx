import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const masteryData = [
  { subject: "Kinematics", A: 85, fullMark: 100 },
  { subject: "Dynamics", A: 90, fullMark: 100 },
  { subject: "Circular Motion", A: 75, fullMark: 100 },
  { subject: "Energy", A: 80, fullMark: 100 },
  { subject: "Momentum", A: 95, fullMark: 100 },
  { subject: "Rotational Motion", A: 70, fullMark: 100 },
  { subject: "Oscillations", A: 65, fullMark: 100 },
  { subject: "Gravitation", A: 88, fullMark: 100 },
];

const accuracyData = [
  { date: "2024-07-01", accuracy: 70, difficulty: 3 },
  { date: "2024-07-02", accuracy: 75, difficulty: 4 },
  { date: "2024-07-03", accuracy: 72, difficulty: 3.5 },
  { date: "2024-07-04", accuracy: 80, difficulty: 5 },
  { date: "2024-07-05", accuracy: 85, difficulty: 4.5 },
  { date: "2024-07-06", accuracy: 82, difficulty: 5.5 },
  { date: "2024-07-07", accuracy: 88, difficulty: 6 },
];

export default function Analytics() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Mastery Radar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              A radar chart showing mastery per unit will be displayed here.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={masteryData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Mastery"
                  dataKey="A"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accuracy vs. Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              A time-series chart for accuracy vs. difficulty will be displayed here.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Difficulty', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="var(--color-chart-1)" name="Accuracy" unit="%" />
                <Line yAxisId="right" type="monotone" dataKey="difficulty" stroke="var(--color-chart-2)" name="Avg. Difficulty" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
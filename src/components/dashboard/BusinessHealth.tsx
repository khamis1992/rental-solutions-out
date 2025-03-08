
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, Activity, Info } from "lucide-react";

export const BusinessHealth = () => {
  const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
  
  // Health metrics simulation
  const healthMetrics = [
    { name: 'Healthy', value: 70, color: '#22c55e', icon: CheckCircle },
    { name: 'Attention', value: 20, color: '#f59e0b', icon: AlertTriangle },
    { name: 'Critical', value: 10, color: '#ef4444', icon: AlertTriangle },
  ];

  const financialHealthData = [
    { name: 'Profit Margin', value: 85, color: '#22c55e', icon: CheckCircle },
    { name: 'Cash Flow', value: 60, color: '#f59e0b', icon: Info },
    { name: 'Asset Utilization', value: 75, color: '#22c55e', icon: CheckCircle },
  ];

  const operationalHealthData = [
    { name: 'Vehicle Utilization', value: 80, color: '#22c55e', icon: CheckCircle },
    { name: 'Maintenance Compliance', value: 65, color: '#f59e0b', icon: Info },
    { name: 'Customer Satisfaction', value: 90, color: '#22c55e', icon: CheckCircle },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{`Value: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        {payload.map((entry: any, index: number) => {
          const IconComponent = healthMetrics[index].icon;
          return (
            <div key={`item-${index}`} className="flex items-center gap-1">
              <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: entry.color }}>
                <IconComponent className="h-3 w-3 text-white" />
              </div>
              <span>{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Business Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="operational">Operational</TabsTrigger>
          </TabsList>
          <TabsContent value="overall" className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={healthMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {healthMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 text-center">
              {healthMetrics.map((metric, index) => (
                <div 
                  key={index} 
                  className="p-2 rounded-md flex flex-col items-center"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <metric.icon className="h-5 w-5 mb-1" style={{ color: metric.color }} />
                  <p className="text-xs font-medium">{metric.name}</p>
                  <p className="text-lg font-bold">{metric.value}%</p>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="financial">
            <div className="space-y-4">
              {financialHealthData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="w-2/3 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="operational">
            <div className="space-y-4">
              {operationalHealthData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="w-2/3 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

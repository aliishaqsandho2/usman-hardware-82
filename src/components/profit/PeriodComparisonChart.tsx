import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { PeriodComparison } from "@/services/profitApi";

interface PeriodComparisonChartProps {
  data: PeriodComparison[];
  isLoading: boolean;
}

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace('PKR', 'Rs ');
};

const formatNumber = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + 'Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(1) + 'L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
};

const getPeriodLabel = (period: string) => {
  const labels: Record<string, string> = {
    'today': 'Today',
    'last_week': 'Last Week',
    'last_2_weeks': '2 Weeks Ago',
    'last_3_weeks': '3 Weeks Ago',
    'last_4_weeks': '4 Weeks Ago',
    'last_30_days': 'Last 30 Days'
  };
  return labels[period] || period;
};

export function PeriodComparisonChart({ data, isLoading }: PeriodComparisonChartProps) {
  if (isLoading || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Period Comparison Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted/50 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    periodLabel: getPeriodLabel(item.period),
    revenueNum: parseFloat(item.revenue),
    profitNum: parseFloat(item.profit),
    margin: parseFloat(item.profit) / parseFloat(item.revenue) * 100
  }));

  // Summary cards data
  const todayData = data.find(d => d.period === 'today');
  const lastWeekData = data.find(d => d.period === 'last_week');
  const last30DaysData = data.find(d => d.period === 'last_30_days');

  const todayProfit = parseFloat(todayData?.profit || '0');
  const lastWeekProfit = parseFloat(lastWeekData?.profit || '0');
  const todayRevenue = parseFloat(todayData?.revenue || '0');
  const lastWeekRevenue = parseFloat(lastWeekData?.revenue || '0');

  const profitTrend = todayProfit > lastWeekProfit / 7 ? 'up' : 'down';
  const revenueTrend = todayRevenue > lastWeekRevenue / 7 ? 'up' : 'down';

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profit Comparison Bar Chart */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Profit Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="profitBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                <XAxis 
                  dataKey="periodLabel" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                  formatter={(value) => [formatCurrency(value as number), 'Profit']}
                />
                <Bar 
                  dataKey="profitNum" 
                  fill="url(#profitBarGradient)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue & Profit Line Chart */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Revenue & Profit Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span>Profit</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                <XAxis 
                  dataKey="periodLabel" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="revenue"
                  orientation="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis 
                  yAxisId="profit"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                  formatter={(value, name) => [
                    formatCurrency(value as number),
                    name === 'revenueNum' ? 'Revenue' : 'Profit'
                  ]}
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenueNum"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="profit"
                  type="monotone"
                  dataKey="profitNum"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
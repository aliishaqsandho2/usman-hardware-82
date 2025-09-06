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
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Today's Profit</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  Rs. {formatNumber(todayProfit)}
                </p>
                <Badge variant={profitTrend === 'up' ? 'default' : 'destructive'} className="text-xs mt-1">
                  {profitTrend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  vs daily avg
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Weekly Profit</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  Rs. {formatNumber(lastWeekProfit)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Last 7 days performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">30-Day Profit</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  Rs. {formatNumber(parseFloat(last30DaysData?.profit || '0'))}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Monthly performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Avg Margin</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {(chartData.reduce((sum, item) => sum + item.margin, 0) / chartData.length).toFixed(1)}%
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Across all periods
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

        {/* Revenue & Profit Area Chart */}
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
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
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
                  formatter={(value, name) => [
                    formatCurrency(value as number),
                    name === 'revenueNum' ? 'Revenue' : 'Profit'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenueNum"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profitNum"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#profitGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
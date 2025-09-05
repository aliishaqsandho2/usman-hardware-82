import { useQuery } from "@tanstack/react-query";
import { profitApi } from "@/services/profitApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, TrendingUp, BarChart3, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace('PKR', 'Rs ');
};

const formatPercentage = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toFixed(1)}%`;
};

export default function ProfitMainChart() {
  // Fetch data for different time periods
  const { data: weeklyTrends, isLoading: weeklyLoading } = useQuery({
    queryKey: ['profit-weekly-trends-main'],
    queryFn: () => profitApi.getWeeklyTrends(12), // Last 12 weeks
  });

  const { data: dailyTrends, isLoading: dailyLoading } = useQuery({
    queryKey: ['profit-daily-trends-main'],
    queryFn: () => profitApi.getWeeklyTrends(4), // Last 4 weeks for daily breakdown
  });

  const { data: monthlyTrends, isLoading: monthlyLoading } = useQuery({
    queryKey: ['profit-monthly-trends-main'],
    queryFn: () => profitApi.getMonthlyTrends(12), // Last 12 months
  });

  const { data: ytdSummary, isLoading: ytdLoading } = useQuery({
    queryKey: ['profit-ytd-summary-main'],
    queryFn: profitApi.getYTDSummary,
  });

  const isLoading = weeklyLoading || dailyLoading || monthlyLoading || ytdLoading;

  // Transform data for charts
  const dailyChartData = dailyTrends?.map((trend, index) => ({
    period: `Day ${7 - index}`,
    profit: parseFloat(trend.weekly_profit) / 7, // Approximate daily from weekly
    revenue: parseFloat(trend.weekly_revenue) / 7,
    margin: parseFloat(trend.week_margin),
    sales: Math.round(parseInt(trend.sales_count) / 7)
  })).reverse();

  const weeklyChartData = weeklyTrends?.map(trend => ({
    period: `Week ${trend.week_number}`,
    profit: parseFloat(trend.weekly_profit),
    revenue: parseFloat(trend.weekly_revenue),
    margin: parseFloat(trend.week_margin),
    sales: parseInt(trend.sales_count)
  }));

  const monthlyChartData = monthlyTrends?.map(trend => ({
    period: trend.period,
    profit: parseFloat(trend.monthly_profit),
    revenue: parseFloat(trend.monthly_revenue),
    margin: parseFloat(trend.margin),
    sales: parseInt(trend.sales_count)
  }));

  // Create yearly data (simplified - using available data)
  const yearlyChartData = ytdSummary ? [{
    period: "2025 YTD",
    profit: parseFloat(ytdSummary.ytd_profit),
    revenue: parseFloat(ytdSummary.ytd_revenue),
    margin: parseFloat(ytdSummary.ytd_margin),
    sales: parseInt(ytdSummary.ytd_sales)
  }] : [];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-background to-muted/20 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Profit Trends Overview
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Yearly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Daily Profit Trends</h3>
              <div className="text-sm text-muted-foreground">Last 7 days summary</div>
            </div>
            
            {/* Daily Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">Avg Daily Profit</div>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(dailyChartData?.reduce((sum, day) => sum + day.profit, 0) / (dailyChartData?.length || 1) || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Avg Daily Revenue</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(dailyChartData?.reduce((sum, day) => sum + day.revenue, 0) / (dailyChartData?.length || 1) || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">Avg Margin</div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatPercentage(dailyChartData?.reduce((sum, day) => sum + day.margin, 0) / (dailyChartData?.length || 1) || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">Avg Daily Sales</div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {Math.round(dailyChartData?.reduce((sum, day) => sum + day.sales, 0) / (dailyChartData?.length || 1) || 0)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span>Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyChartData}>
                <defs>
                  <linearGradient id="profitGradientDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                <XAxis 
                  dataKey="period" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'margin' ? formatPercentage(value as number) : formatCurrency(value as number),
                    name === 'profit' ? 'Profit' : name === 'revenue' ? 'Revenue' : 'Margin'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weekly Profit Trends</h3>
              <div className="text-sm text-muted-foreground">Last 12 weeks summary</div>
            </div>
            
            {/* Weekly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">Avg Weekly Profit</div>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(weeklyChartData?.reduce((sum, week) => sum + week.profit, 0) / (weeklyChartData?.length || 1) || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Avg Weekly Revenue</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(weeklyChartData?.reduce((sum, week) => sum + week.revenue, 0) / (weeklyChartData?.length || 1) || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">Avg Margin</div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatPercentage(weeklyChartData?.reduce((sum, week) => sum + week.margin, 0) / (weeklyChartData?.length || 1) || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">Total Weekly Sales</div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {weeklyChartData?.reduce((sum, week) => sum + week.sales, 0) || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span>Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={weeklyChartData}>
                <defs>
                  <linearGradient id="profitGradientWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                <XAxis 
                  dataKey="period" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'margin' ? formatPercentage(value as number) : formatCurrency(value as number),
                    name === 'profit' ? 'Profit' : name === 'revenue' ? 'Revenue' : 'Margin'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Monthly Profit Performance</h3>
              <div className="text-sm text-muted-foreground">Last 12 months summary</div>
            </div>
            
            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">Avg Monthly Profit</div>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(monthlyChartData?.reduce((sum, month) => sum + month.profit, 0) / (monthlyChartData?.length || 1) || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Avg Monthly Revenue</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(monthlyChartData?.reduce((sum, month) => sum + month.revenue, 0) / (monthlyChartData?.length || 1) || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">Avg Margin</div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatPercentage(monthlyChartData?.reduce((sum, month) => sum + month.margin, 0) / (monthlyChartData?.length || 1) || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">Total Monthly Sales</div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {monthlyChartData?.reduce((sum, month) => sum + month.sales, 0) || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span>Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span>Margin %</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="profitGradientMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                <XAxis 
                  dataKey="period" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'margin' ? formatPercentage(value as number) : formatCurrency(value as number),
                    name === 'profit' ? 'Profit' : name === 'revenue' ? 'Revenue' : 'Margin'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Year-to-Date Performance</h3>
              <div className="text-sm text-muted-foreground">
                Current year summary
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">Total Profit</div>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(ytdSummary?.ytd_profit || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Total Revenue</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(ytdSummary?.ytd_revenue || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">Profit Margin</div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatPercentage(ytdSummary?.ytd_margin || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">Total Sales</div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {ytdSummary?.ytd_sales || 0}
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyChartData}>
                <defs>
                  <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                <XAxis 
                  dataKey="period" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'margin' ? formatPercentage(value as number) : formatCurrency(value as number),
                    name === 'profit' ? 'Profit' : name === 'revenue' ? 'Revenue' : 'Margin'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={4}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
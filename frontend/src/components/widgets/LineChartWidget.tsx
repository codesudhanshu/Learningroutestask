import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart 
} from 'recharts';
import type { WidgetConfig, TimeSeriesData } from '../../types/dashboard';
import { fetchMockData } from '../../api/dashboardApi';

interface LineChartWidgetProps {
  config: WidgetConfig;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-3 border border-gray-300 rounded-lg shadow-sm">
        <p className="text-gray-600 text-sm mb-1">
          {new Date(label).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>
        <p className="text-green-600 font-semibold">
          Value: <span className="text-gray-900">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

// ✅ FIXED: Proper date formatting function
const formatDate = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`; // ✅ MM/DD format
  } catch (error) {
    return timestamp;
  }
};

const LineChartWidget: React.FC<LineChartWidgetProps> = ({ config }) => {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const mockData = await fetchMockData('temporal');
        setData(mockData as TimeSeriesData[]);
      } catch (error) {
        console.error('Failed to fetch line chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [config.dataSource]);

  // Calculate statistics
  const calculateStats = () => {
    if (data.length === 0) return { 
      average: 0, 
      trend: 0, 
      volatility: 0,
      current: 0,
      high: 0,
      low: 0 
    };
    
    const values = data.map(item => item.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    
    // Calculate trend (simple linear regression)
    const n = values.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = values.reduce((sum, val, idx) => sum + val, 0);
    const xySum = values.reduce((sum, val, idx) => sum + val * idx, 0);
    const x2Sum = values.reduce((sum, _, idx) => sum + idx * idx, 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    const trend = (slope / average) * 100; // Percentage trend
    
    // Calculate volatility (standard deviation)
    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / n;
    const volatility = Math.sqrt(variance);
    
    const current = values[values.length - 1] || 0;
    const high = Math.max(...values);
    const low = Math.min(...values);
    
    return { average, trend, volatility, current, high, low };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading line chart...</span>
      </div>
    );
  }

  const isTrendPositive = stats.trend > 0;

  return (
    <div className="line-chart-widget p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{config.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            Current: {stats.current.toLocaleString()}
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Avg: {stats.average.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </span>
          <span className={`px-2 py-1 rounded ${isTrendPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Trend: {stats.trend.toFixed(2)}%
            {isTrendPositive ? ' ↗' : ' ↘'}
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            High: {stats.high.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatDate} // ✅ FIXED: Using custom formatter
              tick={{ fontSize: 11 }}
              minTickGap={30}
            />
            <YAxis 
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorValue)"
              strokeWidth={2}
              name="Value"
            />
            <ReferenceLine 
              y={stats.average} 
              stroke="#ff7300" 
              strokeDasharray="3 3" 
              label={{
                value: `Avg: ${stats.average.toFixed(1)}`,
                position: 'right',
                fill: '#ff7300',
                fontSize: 12
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-600">
          <div>
            <span className="font-medium">Time Points:</span> {data.length}
          </div>
          <div>
            <span className="font-medium">Volatility:</span> {stats.volatility.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">Period:</span> {data.length} days
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineChartWidget;
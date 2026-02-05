import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import type { WidgetConfig, CategoricalData } from '../../types/dashboard';
import { fetchMockData } from '../../api/dashboardApi';

interface BarChartWidgetProps {
  config: WidgetConfig;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-3 border border-gray-300 rounded-lg shadow-sm">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <p className="text-blue-600 font-medium">
          Value: <span className="text-gray-900">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const BarChartWidget: React.FC<BarChartWidgetProps> = ({ config }) => {
  const [data, setData] = useState<CategoricalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const mockData = await fetchMockData('categorical');
        setData(mockData as CategoricalData[]);
      } catch (error) {
        console.error('Failed to fetch bar chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [config.dataSource]);

  // Calculate statistics
  const calculateStats = () => {
    if (data.length === 0) return { total: 0, average: 0, max: 0, min: 0 };
    
    const values = data.map(item => item.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return { total, average, max, min };
  };

  const stats = calculateStats();
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading bar chart...</span>
      </div>
    );
  }

  return (
    <div className="bar-chart-widget p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{config.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Total: {stats.total.toLocaleString()}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            Avg: {stats.average.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </span>
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
            Max: {stats.max.toLocaleString()}
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Min: {stats.min.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Value" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-600">
          <div>
            <span className="font-medium">Categories:</span> {data.length}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChartWidget;
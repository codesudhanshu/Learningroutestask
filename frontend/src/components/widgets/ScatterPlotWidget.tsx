import React, { useEffect, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { WidgetConfig, RelationalData } from '../../types/dashboard';
import { fetchMockData } from '../../api/dashboardApi';

interface ScatterPlotWidgetProps {
  config: WidgetConfig;
}

// Custom Tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}>
        <p><strong>{data.label || 'Point'}</strong></p>
        <p>X: {data.x?.toFixed(2)}</p>
        <p>Y: {data.y?.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const ScatterPlotWidget: React.FC<ScatterPlotWidgetProps> = ({ config }) => {
  const [data, setData] = useState<RelationalData[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const mockData = await fetchMockData('relational');
        // Ensure data is properly typed
        const typedData = (mockData as RelationalData[]).map(item => ({
          ...item,
          x: Number(item.x),
          y: Number(item.y),
        }));
        setData(typedData);
      } catch (error) {
        console.error('Failed to fetch scatter plot data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [config.dataSource]);

  const calculateCorrelation = () => {
    if (data.length < 2) return 0;

    const n = data.length;
    const sumX = data.reduce((acc, point) => acc + point.x, 0);
    const sumY = data.reduce((acc, point) => acc + point.y, 0);
    const sumXY = data.reduce((acc, point) => acc + point.x * point.y, 0);
    const sumX2 = data.reduce((acc, point) => acc + point.x * point.x, 0);
    const sumY2 = data.reduce((acc, point) => acc + point.y * point.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator !== 0 ? numerator / denominator : 0;
  };

  const correlation = calculateCorrelation();

  if (loading) return <div>Loading scatter plot...</div>;

  return (
    <div className="scatter-plot-widget">
      <h3>{config.title}</h3>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="X Axis" 
              domain={[0, 100]}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Y Axis" 
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter
              name="Data Points"
              data={data}
              fill="#8884d8"
              shape="circle"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="stats" style={{ marginTop: 10, fontSize: 12 }}>
        <div>
          <strong>Correlation Coefficient:</strong>{' '}
          <span style={{ 
            color: correlation > 0.5 ? 'green' : correlation < -0.5 ? 'red' : 'orange' 
          }}>
            {correlation.toFixed(3)}
          </span>
        </div>
        <div>
          <strong>Total Points:</strong> {data.length}
        </div>
      </div>
    </div>
  );
};

export default ScatterPlotWidget;
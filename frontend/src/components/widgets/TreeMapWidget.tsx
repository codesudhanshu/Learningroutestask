import React, { useEffect, useState } from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import type { WidgetConfig, HierarchicalData } from '../../types/dashboard';
import { fetchMockData } from '../../api/dashboardApi';

interface TreeMapWidgetProps {
  config: WidgetConfig;
}

// Custom content component
const CustomizedContent: React.FC<any> = (props) => {
  const { 
    root, 
    depth, 
    x, 
    y, 
    width, 
    height, 
    index, 
    name, 
    value 
  } = props;
  
  const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[index % 6] : 'rgba(255,255,255,0)',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
      ) : null}
      {depth === 1 && width > 50 && height > 30 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 - 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
        >
          {value}
        </text>
      ) : null}
    </g>
  );
};

const TreeMapWidget: React.FC<TreeMapWidgetProps> = ({ config }) => {
  const [data, setData] = useState<any[]>([]); // any use karo temporary
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const mockData = await fetchMockData('hierarchical');
        // Recharts compatible format mein convert karo
        if (mockData && mockData.children) {
          const formattedData = mockData.children.map((item: any) => ({
            ...item,
            // Ensure value exists
            value: item.value || 100,
            // Add index signature compatible properties
            size: item.value || 100,
          }));
          setData(formattedData);
        }
      } catch (error) {
        console.error('Failed to fetch treemap data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [config.dataSource]);

  if (loading) return <div>Loading treemap...</div>;

  // Agar data empty hai toh fallback
  if (data.length === 0) {
    return <div>No hierarchical data available</div>;
  }

  return (
    <div className="treemap-widget">
      <h3>{config.title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <Treemap
            data={data}
            dataKey="value"
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent />}
          >
            <Tooltip
              formatter={(value: any) => {
                const numValue = Number(value);
                return !isNaN(numValue) ? numValue.toFixed(0) : value;
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
      <div className="legend" style={{ marginTop: 10, fontSize: 12 }}>
        <span>Hierarchical Data: Size represents value</span>
      </div>
    </div>
  );
};

export default TreeMapWidget;
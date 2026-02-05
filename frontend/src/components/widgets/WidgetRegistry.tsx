import React from 'react';
import type { WidgetConfig } from '../../types/dashboard';
import BarChartWidget from './BarChartWidget';
import LineChartWidget from './LineChartWidget';
import TreeMapWidget from './TreeMapWidget';
import ScatterPlotWidget from './ScatterPlotWidget';

interface WidgetRegistryProps {
  widget: WidgetConfig;
}

const WidgetRegistry: React.FC<WidgetRegistryProps> = ({ widget }) => {
  const renderWidget = () => {
    switch (widget.type) {
      case 'bar':
        return <BarChartWidget config={widget} />;
      case 'line':
        return <LineChartWidget config={widget} />;
      case 'treemap':
        return <TreeMapWidget config={widget} />;
      case 'scatter':
        return <ScatterPlotWidget config={widget} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className="widget-container" style={{ height: '100%' }}>
      {renderWidget()}
    </div>
  );
};

export default WidgetRegistry;
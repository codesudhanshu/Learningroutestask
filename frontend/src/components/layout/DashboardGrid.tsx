import React from 'react';
import RGL from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetRegistry from '../widgets/WidgetRegistry';
import type { WidgetConfig } from '../../types/dashboard';
import { useDashboardStore } from '../../store/useDashboardStore';

const ResponsiveGridLayout = RGL.WidthProvider(RGL.Responsive);

interface DashboardGridProps {
  widgets: WidgetConfig[];
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ widgets }) => {
  const { isEditing, updateWidget, setLayout, removeWidget } = useDashboardStore();

  const layout = widgets.map(widget => ({
    i: widget.id,
    x: widget.position.x,
    y: widget.position.y,
    w: widget.position.w,
    h: widget.position.h,
    minW: 2,
    minH: 2,
    maxW: 12,
    maxH: 8,
  }));

  const handleLayoutChange = (newLayout: any[]) => {
    if (!isEditing) return;

    const updatedWidgets = widgets.map(widget => {
      const newPos = newLayout.find(l => l.i === widget.id);
      if (newPos) {
        return {
          ...widget,
          position: {
            x: newPos.x,
            y: newPos.y,
            w: newPos.w,
            h: newPos.h,
          },
        };
      }
      return widget;
    });

    setLayout(updatedWidgets);
  };

  const handleRemoveWidget = (widgetId: string) => {
    removeWidget(widgetId);
  };

  return (
    <div className="dashboard-grid">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        margin={[10, 10]}
        containerPadding={[0, 0]}
      >
        {widgets.map(widget => (
          <div key={widget.id} className="relative group">
            {/* Widget content */}
            <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <WidgetRegistry widget={widget} />
            </div>
            
            {/* Remove button (shown on hover when editing) */}
            {isEditing && (
              <button
                onClick={() => handleRemoveWidget(widget.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                title="Remove widget"
              >
                ×
              </button>
            )}
            
            {/* Edit indicator */}
            {isEditing && (
              <div className="absolute top-2 left-2">
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  ✏️ Draggable
                </div>
              </div>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardGrid;
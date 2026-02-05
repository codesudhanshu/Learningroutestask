import {
  CategoricalData,
  TimeSeriesData,
  HierarchicalData,
  RelationalData,
} from '../types';

export class MockDataService {
  // Categorical data (Bar Chart)
  static generateCategoricalData(count: number = 5): CategoricalData[] {
    const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports', 'Home', 'Beauty'];
    return Array.from({ length: count }, (_, i) => ({
      name: categories[i % categories.length],
      value: Math.floor(Math.random() * 1000) + 100,
    }));
  }

  // Time series data (Line Chart)
  static generateTimeSeriesData(days: number = 30): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    let value = 100;
    
    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      value += Math.random() * 20 - 10; // Random walk
      value = Math.max(50, Math.min(200, value)); // Keep within bounds
      
      data.push({
        timestamp: date.toISOString(),
        value: Math.round(value),
      });
    }
    
    return data;
  }

  // Hierarchical data (TreeMap)
  static generateHierarchicalData(): HierarchicalData {
    const regions = ['North America', 'Europe', 'Asia', 'South America'];
    const categories = ['Technology', 'Finance', 'Healthcare', 'Retail'];
    
    return {
      name: 'Global Sales',
      children: regions.map(region => ({
        name: region,
        children: categories.map(category => ({
          name: category,
          value: Math.floor(Math.random() * 500) + 100,
        })),
      })),
    };
  }

  // Relational data (Scatter Plot)
  static generateRelationalData(count: number = 50): RelationalData[] {
    const correlation = Math.random() > 0.5 ? 0.7 : -0.3;
    
    return Array.from({ length: count }, (_, i) => {
      const x = Math.random() * 100;
      const y = correlation * x + (Math.random() * 30 - 15);
      
      return {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        label: `Point ${i + 1}`,
      };
    });
  }

  // Get data by type
  static getDataByType(type: string, params?: any) {
    switch (type) {
      case 'categorical':
        return this.generateCategoricalData(params?.count);
      case 'temporal':
        return this.generateTimeSeriesData(params?.days);
      case 'hierarchical':
        return this.generateHierarchicalData();
      case 'relational':
        return this.generateRelationalData(params?.count);
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }
}
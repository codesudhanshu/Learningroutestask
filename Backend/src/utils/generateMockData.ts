import {
  CategoricalData,
  TimeSeriesData,
  HierarchicalData,
  RelationalData
} from '../types';

// Categories for mock data
const categories = [
  'Electronics', 'Clothing', 'Food & Beverages', 'Books', 
  'Home Decor', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Health'
];

const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'];
const timePeriods = ['Q1', 'Q2', 'Q3', 'Q4'];

export class MockDataGenerator {
  // Categorical data for bar charts
  static generateCategoricalData(count: number = 8): CategoricalData[] {
    return categories.slice(0, count).map((category, index) => ({
      name: category,
      value: Math.floor(Math.random() * 1000) + 500
    }));
  }

  // Time series data for line charts
  static generateTimeSeriesData(days: number = 30): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    let value = 100;
    const baseDate = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      // Random walk with trend
      value += (Math.random() - 0.4) * 20;
      value = Math.max(50, Math.min(300, value));
      
      data.push({
        timestamp: date.toISOString(),
        value: Math.round(value)
      });
    }
    
    return data;
  }

  // Hierarchical data for treemaps
  static generateHierarchicalData(): HierarchicalData {
    return {
      name: 'Global Sales',
      children: regions.map(region => ({
        name: region,
        children: timePeriods.map(period => ({
          name: period,
          value: Math.floor(Math.random() * 5000) + 1000
        }))
      }))
    };
  }

  // Relational data for scatter plots
  static generateRelationalData(count: number = 50): RelationalData[] {
    const correlation = Math.random() > 0.5 ? 0.7 : -0.3;
    const data: RelationalData[] = [];
    
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 100;
      const y = correlation * x + (Math.random() * 30 - 15);
      
      // Create some clusters
      if (i % 8 === 0) {
        data.push({
          x: 20 + Math.random() * 15,
          y: 25 + Math.random() * 15,
          label: `Cluster A-${i}`
        });
      } else if (i % 5 === 0) {
        data.push({
          x: 70 + Math.random() * 15,
          y: 65 + Math.random() * 15,
          label: `Cluster B-${i}`
        });
      } else {
        data.push({
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
          label: `Point ${i + 1}`
        });
      }
    }
    
    return data;
  }

  // Get data by type
  static getDataByType(type: string, params?: any): any {
    switch (type.toLowerCase()) {
      case 'categorical':
      case 'bar':
        return this.generateCategoricalData(params?.count);
      
      case 'temporal':
      case 'line':
      case 'timeseries':
        return this.generateTimeSeriesData(params?.days);
      
      case 'hierarchical':
      case 'treemap':
      case 'sunburst':
        return this.generateHierarchicalData();
      
      case 'relational':
      case 'scatter':
      case 'correlation':
        return this.generateRelationalData(params?.count);
      
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }
}
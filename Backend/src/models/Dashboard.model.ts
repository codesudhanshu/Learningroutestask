// models/Dashboard.ts
import { Schema, model, Document, Types } from 'mongoose';

// ✅ Widget interface for embedded documents
interface IWidget {
  id: string;
  type: string;
  title: string;
  dataSource: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: Record<string, any>;
}

export interface IDashboard extends Document {
  name: string;
  description?: string;
  userId: Types.ObjectId;
  widgets: IWidget[]; // ✅ Array of embedded documents
  layout: any;
  isLocked: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WidgetSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['bar', 'line', 'treemap', 'scatter', 'pie', 'table', 'gauge', 'area']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  dataSource: {
    type: String,
    required: true,
    default: 'default'
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    w: { type: Number, default: 4 },
    h: { type: Number, default: 3 }
  },
  config: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { 
  _id: false, // ✅ No separate _id for embedded docs
  timestamps: false 
});

const DashboardSchema = new Schema<IDashboard>({
  name: {
    type: String,
    required: [true, 'Dashboard name is required'],
    trim: true,
    minlength: [1, 'Dashboard name must be at least 1 character'],
    maxlength: [100, 'Dashboard name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // ✅ Array of embedded widget documents
  widgets: {
    type: [WidgetSchema],
    default: []
  },
  
  layout: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  isLocked: {
    type: Boolean,
    default: false
  },
  
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

// ✅ Index for faster queries
DashboardSchema.index({ userId: 1, createdAt: -1 });
DashboardSchema.index({ userId: 1, updatedAt: -1 });

export const Dashboard = model<IDashboard>('Dashboard', DashboardSchema);
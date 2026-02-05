import { Schema, model, Document, Types } from 'mongoose';

export type WidgetType = 'bar' | 'line' | 'treemap' | 'scatter';

export interface IWidget extends Document {
  type: WidgetType;
  title: string;
  dataSource: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: Record<string, any>;
  userId: Types.ObjectId;
  dashboardId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WidgetSchema = new Schema<IWidget>({
  type: {
    type: String,
    required: true,
    enum: ['bar', 'line', 'treemap', 'scatter'],
    index: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  dataSource: {
    type: String,
    required: true,
    trim: true
  },
  
  position: {
    x: { type: Number, required: true, min: 0, max: 100 },
    y: { type: Number, required: true, min: 0, max: 100 },
    w: { type: Number, required: true, min: 1, max: 12 },
    h: { type: Number, required: true, min: 1, max: 8 }
  },
  
  config: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  dashboardId: {
    type: Schema.Types.ObjectId,
    ref: 'Dashboard',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Create compound index for dashboard widgets
WidgetSchema.index({ dashboardId: 1, createdAt: -1 });

export const Widget = model<IWidget>('Widget', WidgetSchema);
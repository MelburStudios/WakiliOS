import { Schema, model, Document } from 'mongoose';

export interface IBlogCategory extends Document {
  name: string;
}

export interface IBlogTag extends Document {
  name: string;
}

export interface IBlogPost extends Document {
  title: string;
  blog_category: Schema.Types.ObjectId;
  blog_tags: Schema.Types.ObjectId[];
  short_description: string;
  description: string;
  images: string[];
  feature: boolean;
  is_popular: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const blogTagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const blogPostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  blog_category: {
    type: Schema.Types.ObjectId,
    ref: 'BlogCategory',
    required: true
  },
  blog_tags: [{
    type: Schema.Types.ObjectId,
    ref: 'BlogTag'
  }],
  short_description: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  feature: {
    type: Boolean,
    default: false
  },
  is_popular: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const BlogCategory = model<IBlogCategory>('BlogCategory', blogCategorySchema);
export const BlogTag = model<IBlogTag>('BlogTag', blogTagSchema);
export const BlogPost = model<IBlogPost>('BlogPost', blogPostSchema);

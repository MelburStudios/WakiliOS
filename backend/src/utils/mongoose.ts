
import { HydratedDocument, PipelineStage, Schema } from 'mongoose';
interface PaginateOptions {
    page?: number;
    limit?: number;
    sort?: any;
    populate?: any;
    select?: any;
}

interface AggregatePaginateOptions {
    page?: number;
    limit?: number;
    sort?: any;
}

interface PaginateResult<T> {
    page: number;
    limit: number;
    totalDocs: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    docs: HydratedDocument<T>[];
}

function paginate<T>(schema: Schema<T>) {
    schema.statics.paginate = async function (
        this: any,
        filters: Record<string, any> = {},
        options: PaginateOptions = {}
    ): Promise<PaginateResult<T>> {
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;
        const skip = (page - 1) * limit;
        const totalDocs = await this.countDocuments(filters);
        const totalPages = Math.ceil(totalDocs / limit);
        
        let query = this.find(filters, options.select);
        if (options.sort) query = query.sort(options.sort);
        if (options.populate) query = query.populate(options.populate);
        
        const docs = await query.skip(skip).limit(limit).exec();
        
        return {
            page,
            limit,
            totalDocs,
            totalPages,
            docs,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    };
}

function aggregatePaginate<T>(schema: Schema<T>) {
    schema.statics.aggregatePaginate = async function (
        this: any,
        pipeline: PipelineStage[],
        options: AggregatePaginateOptions = {},
        after: PipelineStage[] = []
    ): Promise<PaginateResult<T>> {
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;
        const skip = (page - 1) * limit;
        
        const result = await this.aggregate([
            ...pipeline,
            ...(options.sort ? [{ $sort: options.sort }] : []),
            {
                $facet: {
                    docs: [
                        { $skip: skip },
                        { $limit: limit },
                        ...after
                    ],
                    totalDocs: [
                        { $count: 'count' }
                    ]
                }
            },
            {
                $project: {
                    docs: 1,
                    totalDocs: { $ifNull: [{ $arrayElemAt: ['$totalDocs.count', 0] }, 0] },
                    page: { $literal: page },
                    limit: { $literal: limit },
                    totalPages: { $ceil: { $divide: [{ $ifNull: [{ $arrayElemAt: ['$totalDocs.count', 0] }, 0] }, limit] } }
                }
            },
            {
                $addFields: {
                    hasNextPage: { $lt: ['$page', '$totalPages'] },
                    hasPrevPage: { $gt: ['$page', 1] }
                }
            }
        ]).exec();
        
        return result[0] as PaginateResult<T>;
    };
}

declare module 'mongoose' {
    //@ts-ignore
    interface Model<T> {
        paginate(filters: Record<string, any>, options: PaginateOptions): Promise<PaginateResult<T>>;
        aggregatePaginate(pipeline: PipelineStage[], options: AggregatePaginateOptions, after?: PipelineStage[]): Promise<PaginateResult<T>>;
    }
}

export { paginate, aggregatePaginate };

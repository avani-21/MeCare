import { Model, Document, FilterQuery, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../interfaces/base.repository";
import { injectable } from "inversify";

@injectable()
export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    private model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        return this.model.create(data);
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findById(id);
    }

    async findOne(query: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(query);
    }

    async findAll(query: FilterQuery<T> = {}): Promise<T[]> {
        return this.model.find(query);
    }

    async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id);
    }
}

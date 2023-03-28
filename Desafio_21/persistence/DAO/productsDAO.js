import mongoose from 'mongoose';
import { logger } from '../../logs/loger.js';
import { transformToDTO } from '../DTO/productsDTO.js';

mongoose.set('useFindAndModify', false);

export default class ProductsDaoMongo {
	constructor(URImongo, advanceOptions, productModels) {
		this.Options = advanceOptions;
		this.URI = URImongo;
		this.model = productModels;
	}

	static getInstance() {
		if (!instance) {
			instance = new ProductsDaoMongo();
		}
		return instance;
	}

	async connect() {
		await mongoose
			.connect(this.URI, this.Options)
			.then((db) => {})
			.catch((err) => {
				logger.error(`Error connecting to the database. ${err}`);
			});
		logger.info('Mongo DB connected');
	}

	async disconnect() {
		await mongoose.disconnect();
		logger.info('Mongo DB diconnected');
	}

	async findProd() {
		return transformToDTO(await this.model.find({}));
	}

	async findProdById(id) {
		return transformToDTO(await this.model.find({ productId: id }));
	}

	async newProd() {
		return new this.model();
	}

	async updateProdById(id, data) {
		return this.model.updateOne({ productId: id }, { $set: data });
	}

	async deleteProdById(id) {
		return await this.model.deleteOne({ productId: id });
	}

	async saveProd(data) {
		await data.save();
	}
}

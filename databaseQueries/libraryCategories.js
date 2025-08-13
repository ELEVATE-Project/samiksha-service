/**
 * name : libraryCategories.js
 * author : PraveenDass.K
 * created-date : 06-Aug-2025
 * Description : Library categories helper for DB interactions.
 */

// Dependencies

/**
 * libraryCategories
 * @class
 */

module.exports = class libraryCategories {
	/**
	 * Library categories documents.
	 * @method
	 * @name categoryDocuments
	 * @param {Object} [findQuery = "all"] - filtered data.
	 * @param {Array} [fields = "all"] - projected data.
	 * @param {Array} [skipFields = "none"] - fields to skip.
	 * @returns {Array} - Library categories data.
	 */

	static categoryDocuments(findQuery = 'all', fields = 'all', skipFields = 'none') {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = {}

				if (findQuery != 'all') {
					queryObject = findQuery
				}

				let projection = {}

				if (fields != 'all') {
					fields.forEach((element) => {
						projection[element] = 1
					})
				}

				if (skipFields != 'none') {
					skipFields.forEach((element) => {
						projection[element] = 0
					})
				}

				let libraryCategoriesData = await database.models.libraryCategories.find(queryObject, projection).lean()

				return resolve(libraryCategoriesData)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * update Many library categories documents.
	 * @method
	 * @name updateMany
	 * @param {Object} [filterQuery] - filtered Query.
	 * @param {Object} [updateData] - update data.
	 * @returns {Array} - Library categories data.
	 */

	static updateMany(filterQuery, updateData) {
		return new Promise(async (resolve, reject) => {
			try {
				let updatedCategories = await database.models.libraryCategories.updateMany(filterQuery, updateData)

				return resolve(updatedCategories)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create library categories documents.
	 * @method
	 * @name create
	 * @param {Object} [filterQuery] - filtered Query.
	 * @returns {Object} - Library  categories data.
	 */

	static create(filterQuery) {
		return new Promise(async (resolve, reject) => {
			try {
				let createdProjectCategory = await database.models.libraryCategories.create(filterQuery)

				return resolve(createdProjectCategory)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create library categories documents.
	 * @method
	 * @name insertMany
	 * @returns {Object} - Library categories data.
	 */
	static insertMany(dataArray) {
		return new Promise(async (resolve, reject) => {
			try {
				// Insert multiple documents into the collection
				let insertedDocuments = await database.models.libraryCategories.insertMany(dataArray)
				return resolve(insertedDocuments)
			} catch (error) {
				return reject(error)
			}
		})
	}
}

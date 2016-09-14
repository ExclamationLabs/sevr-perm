'use strict'

const mergeWith     = require('lodash/mergeWith')
const defaultConfig = require('./default-config')
const Library       = require('./lib')
const constants     = require('./constants')

module.exports = (sevr, _config) => {
	const Sevr = sevr.constructor
	const config = mergeWith({}, defaultConfig, _config)
	const library = Library(Sevr, config)

	const getUser = () => {
		return sevr.authentication.user || { role: constants.DEFAULT_PROP }
	}

	sevr.authentication.events.on('auth-enabled', () => {
		// Add the role field to the auth collection
		sevr.authentication.collection.addField('role', 'Role', {
			type: String,
			enum: Object.keys(config.roles),
			default: constants.DEFAULT_PROP
		})

		// Apply middleware for each collection to check operation permissions
		// for the active user
		Object.keys(sevr.collections)
			.map(c => {
				return sevr.collections[c]
			})
			.forEach(collection => {
				collection.useBefore('create', library.getRoleCheck(getUser, collection.name, 'create'))
				collection.useBefore('read', library.getRoleCheck(getUser, collection.name, 'read'))
				collection.useBefore('update', library.getRoleCheck(getUser, collection.name, 'update'))
				collection.useBefore('delete', library.getRoleCheck(getUser, collection.name, 'delete'))
			})
	})
}

'use strict'

const mergeWith     = require('lodash/mergeWith')
const defaultConfig = require('./default-config')
const Library       = require('./lib')
const constants     = require('./constants')

module.exports = (ichabod, _config) => {
	const Ichabod = ichabod.constructor
	const config = mergeWith({}, defaultConfig, _config)
	const library = Library(Ichabod, config)

	const getUser = () => {
		return ichabod.authentication.user || { role: constants.DEFAULT_PROP }
	}

	ichabod.authentication.events.on('auth-enabled', () => {
		// Add the role field to the auth collection
		ichabod.authentication.collection.addField('role', 'Role', {
			type: String,
			enum: Object.keys(config.roles),
			default: constants.DEFAULT_PROP
		})

		// Apply middleware for each collection to check operation permissions
		// for the active user
		Object.keys(ichabod.collections)
			.map(c => {
				return ichabod.collections[c]
			})
			.forEach(collection => {
				collection.useBefore('create', library.getRoleCheck(getUser, collection.name, 'create'))
				collection.useBefore('read', library.getRoleCheck(getUser, collection.name, 'read'))
				collection.useBefore('update', library.getRoleCheck(getUser, collection.name, 'update'))
				collection.useBefore('delete', library.getRoleCheck(getUser, collection.name, 'delete'))
			})
	})
}

'use strict'

const mergeWith     = require('lodash/mergeWith')
const defaultConfig = require('./default-config')
const Library       = require('./lib')
const constants     = require('./constants')

module.exports = (ichabod, _config) => {
	const Ichabod = ichabod.constructor
	const config = mergeWith({}, defaultConfig, _config)
	const library = Library(Ichabod, config)

	ichabod.authentication.events.on('auth-enabled', () => {
		const user = ichabod.authentication.user || { role: constants.DEFAULT_PROP }

		Object.keys(ichabod.collections)
			.map(c => {
				return ichabod.collections[c]
			})
			.forEach(collection => {
				collection.useBefore('create', library.getRoleCheck(user, collection.name, 'create'))
				collection.useBefore('read', library.getRoleCheck(user, collection.name, 'read'))
				collection.useBefore('update', library.getRoleCheck(user, collection.name, 'update'))
				collection.useBefore('delete', library.getRoleCheck(user, collection.name, 'delete'))
			})
	})
}

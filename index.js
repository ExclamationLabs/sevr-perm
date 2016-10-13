'use strict'

const mergeWith     = require('lodash/mergeWith')
const defaultConfig = require('./default-config')
const Library       = require('./lib')
const constants     = require('./constants')

class SevrPerm {
	constructor(sevr, config) {
		this.sevr = sevr
		this.config = mergeWith({}, defaultConfig, config)
		this.library = Library(sevr, config)

		this.sevr.authentication.events.on('auth-enabled', this._onAuthEnable.bind(this))
	}

	_onAuthEnable() {
		const auth = this.sevr.authentication

		const getUser = () => {
			return auth.user || { role: constants.DEFAULT_PROP }
		}

		// Add the role field to the auth collection
		auth.collection.addField('role', 'Role', {
			type: String,
			enum: Object.keys(this.config.roles),
			default: constants.DEFAULT_PROP
		})

		// Apply middleware for each collection to check operation permissions
		// for the active user
		Object.keys(this.sevr.collections)
			.map(c => {
				return this.sevr.collections[c]
			})
			.forEach(collection => {
				collection.useBefore('create', this.library.getRoleCheck(getUser, collection.name, 'create'))
				collection.useBefore('read', this.library.getRoleCheck(getUser, collection.name, 'read'))
				collection.useBefore('update', this.library.getRoleCheck(getUser, collection.name, 'update'))
				collection.useBefore('delete', this.library.getRoleCheck(getUser, collection.name, 'delete'))
			})
	}
}

module.exports = SevrPerm
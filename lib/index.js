'use strict'

const constants = require('../constants')

module.exports = function(Sevr, config) {
	return {
		getRoleCheck: function(getUser, collection, op) {
			return q => {
				const role = this.getRoleConfig(config.roles, getUser().role)
				const collectionOps = this.getCollectionOpsForRole(role, collection)

				if (collectionOps.indexOf(op) !== -1) {
					return q
				} else {
					throw new Sevr.Errors.AuthError(`[sevr-perm] User does not have "${op}" access for collection "${collection}"`)
				}
			}
		},

		getRoleConfig: function(roles, userRole) {
			if (!Object.hasOwnProperty.call(roles, userRole)) {
				return null
			}

			return roles[userRole]
		},

		getCollectionOpsForRole: function(role, collection) {
			let collectionOps

			if (!role) return []

			if (Object.hasOwnProperty.call(role, collection)) {
				collectionOps = role[collection]
			} else if (Object.hasOwnProperty.call(role, constants.DEFAULT_PROP)) {
				collectionOps = role[constants.DEFAULT_PROP]
			} else {
				return []
			}

			// Cast to an Array
			if (!Array.isArray(collectionOps)) {
				collectionOps = [collectionOps]
			}

			// Expand shorthand operation names
			collectionOps = collectionOps
				.map(op => {
					if (Object.keys(constants.OPERATION_SHORTHAND_PROPERTIES).indexOf(op) !== -1) {
						return constants.OPERATION_SHORTHAND_PROPERTIES[op]
					} else {
						return op
					}
				})
				.reduce((acc, ops) => acc.concat(ops), [])

			return collectionOps
		}
	}
}

'use strict'

const constants = require('../constants')

module.exports = function(sevr, config) {
	const Sevr = sevr.constructor

	return {
		/**
		 * Returns a function to check user role against the current collection
		 * and operation.
		 * Returned function returns the query if role is allowed access.
		 * Throws an error otherwise.
		 * @param  {Function} getUser
		 * @param  {String}   collection
		 * @param  {String}   op
		 * @return {Function}
		 */
		getRoleCheck: function(getUser, collection, op) {
			return q => {
				const role = this.getRoleConfig(config.roles, getUser().role)
				const collectionOps = this.getCollectionOpsForRole(role, collection)

				if (sevr.authentication.isFirstEnable) {
					// Skip permissions check if this is the firt
					// time authentication is being enabled.
					return q
				} else if (collectionOps.indexOf(op) !== -1) {
					return q
				} else {
					throw new Sevr.Errors.AuthError(`[sevr-perm] User does not have "${op}" access for collection "${collection}"`)
				}
			}
		},

		/**
		 * Get the role object for the given user role.
		 * @param  {Object} roles
		 * @param  {String} userRole
		 * @return {Object}
		 */
		getRoleConfig: function(roles, userRole) {
			if (!Object.hasOwnProperty.call(roles, userRole)) {
				return null
			}

			return roles[userRole]
		},

		/**
		 * Get an array of allowed operations on a collection
		 * for a given role.
		 * @param  {Object} role
		 * @param  {String} collection
		 * @return {Array}
		 */
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

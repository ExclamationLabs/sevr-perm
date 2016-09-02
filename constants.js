'use strict'

module.exports = {
	DEFAULT_PROP: '_',
	OPERATION_SHORTHAND_PROPERTIES: {
		c: ['create'],
		r: ['read'],
		u: ['update'],
		d: ['delete'],
		'*': ['create', 'read', 'update', 'delete']
	}
}

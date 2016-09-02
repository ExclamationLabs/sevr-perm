const chai    = require('chai')
const spies   = require('chai-spies')
const Library = require('../../lib')

chai.use(spies)

const expect = chai.expect
const IchabodMock = {
	Errors: {
		AuthError: Error
	}
}

describe('Library', function() {
	describe('getRoleConfig(roles, userRole)', function() {
		it('should return the property from `roles` where key matches `userRole`', function() {
			const library = Library()
			const config = {
				admin: { test: 'admin' },
				'_': { test: 'default' }
			}

			expect(library.getRoleConfig(config, 'admin')).to.eql({ test: 'admin' })
			expect(library.getRoleConfig(config, '_')).to.eql({ test: 'default' })
		})

		it('should return null when `userRole` does not match a property of `roles`', function() {
			const library = Library()
			const config = {
				admin: { test: 'admin' },
				'_': { test: 'default' }
			}

			expect(library.getRoleConfig(config, 'web')).to.be.null
		})
	})

	describe('getCollectionOpsForRole(role, collection)', function() {
		it('should return an array of allowed operations for `collection`', function() {
			const library = Library()
			const config = {
				admin: {
					coll1: ['create', 'read', 'update', 'delete'],
					coll2: ['read', 'update'],
					coll3: ['c', 'r', 'u', 'd'],
					coll4: ['c', 'read', 'u'],
					coll5: 'r',
					coll6: '*'
				}
			}

			expect(library.getCollectionOpsForRole(config.admin, 'coll1')).to.eql(['create', 'read', 'update', 'delete'])
			expect(library.getCollectionOpsForRole(config.admin, 'coll2')).to.eql(['read', 'update'])
			expect(library.getCollectionOpsForRole(config.admin, 'coll3')).to.eql(['create', 'read', 'update', 'delete'])
			expect(library.getCollectionOpsForRole(config.admin, 'coll4')).to.eql(['create', 'read', 'update'])
			expect(library.getCollectionOpsForRole(config.admin, 'coll5')).to.eql(['read'])
			expect(library.getCollectionOpsForRole(config.admin, 'coll6')).to.eql(['create', 'read', 'update', 'delete'])
		})

		it('should return the opeartions from default collection when `role` has no matching collection', function() {
			const library = Library()
			const config = {
				admin: {
					'_': 'r'
				}
			}

			expect(library.getCollectionOpsForRole(config.admin, 'coll')).to.eql(['read'])
		})

		it('should return an empty array when `role` has not matching collection and no default', function() {
			const library = Library()
			const config = {
				admin: {
					'coll1': 'r'
				}
			}

			expect(library.getCollectionOpsForRole(config.admin, 'coll2')).to.be.empty
		})
	})

	describe('getRoleCheck(user, collection, op)', function() {
		it('should return a function', function() {
			const config = {}
			const library = Library(IchabodMock, config)

			expect(library.getRoleCheck({}, 'coll1', 'read')).to.be.a('function')
		})

		it('returned function should return query when `user` has `op` access on `collection`', function() {
			const config = {
				roles: {
					user: {
						coll1: ['read'],
						coll2: 'u'
					}
				}
			}
			const library = Library(IchabodMock, config)
			const fn1 = library.getRoleCheck({ role: 'user' }, 'coll1', 'read')
			const fn2 = library.getRoleCheck({ role: 'user' }, 'coll2', 'update')

			expect(fn1('query')).to.eql('query')
			expect(fn2('query')).to.eql('query')
		})

		it('returned function should throw when `user` does not have `op` access on `collection`', function() {
			const config = {
				roles: {
					user: {
						coll1: ['read'],
						coll2: 'u'
					}
				}
			}
			const library = Library(IchabodMock, config)
			const fn1 = library.getRoleCheck({ role: 'user' }, 'coll1', 'create')
			const fn2 = library.getRoleCheck({ role: 'web' }, 'coll1', 'create')
			const fn3 = library.getRoleCheck({ role: 'user' }, 'coll2', 'create')

			expect(fn1).to.throw('[ichabod-perm] User does not have "create" access for collection "coll1"')
			expect(fn2).to.throw('[ichabod-perm] User does not have "create" access for collection "coll1"')
			expect(fn3).to.throw('[ichabod-perm] User does not have "create" access for collection "coll2"')
		})
	})
})

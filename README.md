# ichabod-perm
---

Add role-based permissions to Ichabod collections at the query operation level.

## Install

```
npm install --save ichabod-perm
```

---

## Usage

```javascript
const perm = require('ichabod-perm')

ichabod.attach(ich-perm, config)
```

### Configuration

The config object should have a single property, `roles`. Each property in the
`roles` object represents a user role. A user role must define operation
permissions for each collection:

```javascript
{
	roles: {
		contributor: {
			posts: ['create', 'read'],
			authors: 'read'
		}
	}
}
```

The user role, `contributor`, has 'create' and 'read' permissions to the
`posts` collection, but only had 'read' permissions on the `authors` collection.

When multiple permisions are defined for a collection, each permission should be
an element in an array. When only a single permission is needed, a string will
suffice.

#### Shorthand
Addionally, you can also the shorthand notation:
```javascript
{
	roles: {
		contributor: {
			posts: ['c', 'r'], // 'create' and 'read' permissions
			authors: 'r', // 'read' permission
			tags: '*' // all permissions
		}
	}
}
```
'u' and 'd' can also be used for 'update' and 'delete', respectively.

#### Default permissions
A default set of permissions can also be defined for any collections that aren't
explicitly defined using '_'.
```javascript
{
	roles: {
		contributor: {
			posts: ['c', 'r'],
			'_': 'r' // all other collections will have read-only permissions
		}
	}
}
```

#### Default role
Like permissions, a default user role can also be defined using '_'.
```javascript
{
	roles: {
		contributor: {
			posts: ['c', 'r']
		},

		// default user role will have read-only
		// access to all collections
		'_': {
			'_': 'r'
		}
	}
}
```

---

## Tests

```
npm test
```

---

## Contributing

TODO

---

## License

This project is licensed under the [MIT license](license.txt).

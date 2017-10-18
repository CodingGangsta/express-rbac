# Express authorization

Express-authorization is an [Express](http://expressjs.com/)-compatible roles and permissions authorization
middleware for [Node.js](http://nodejs.org/).

Express-authorization purpose is to provide traditional roles and permissions
authorization to connect/ express applications, which it does through a
middleware and a set of functions for runtime strategies.  Using express-authorization is really simple. Only hook up the library to the express pipeline providing
a callback function for loading the user roles and permissions.
Once the library is hooked up on the pipeline, just use the 4 built in available handlers for route authorization, or the 4 functions added to the request object to be able to provide runtime strategies regarding the user's roles and permissions.

## Install

```
$ npm install express-authorization
```

## Usage

### Registration

Before using express-authorization, the library should be initialized and hooked up to the pipeline.

```javascript

var express = require('express');
var app = express();

/*
 * Require the library
*/
var auth = require('express-authorization');

/*
 * Hook up the library to the express pipeline.
 * Be sure this is done AFTER authentication.
 * The callback function will receive the
 * request object. So if your authentication library
 * populates the request (like passport.js for example)
 * you could use its data on the function itself.
 * Once you load the user's roles and permissions, use them as a parameter for the done() callback.
*/
app.use(auth.initialize({
  // Use this parameter for binding the library methods to a specified
  // object, instead of the req object itself. For example on passport.js
  // default implementation, the user information is stored in the 'user'
  // property, as specified on this particular example.
    bindToProperty: 'user'
  }, function(req, done) {
    // Get your users roles and/ orpermissions.
    var auth = {
        roles: ['Super Admin', 'User'],
        permissions: ['CanAddContent', 'CanRemoveContent']
    };
    done(auth);
  })
);
```

### Route handlers Authorization

The following route handlers for path authorization are provided.

#### auth.isInRole(string | number | array)

This method validates against one or more specified roles. If multiple roles specified, all should evaluate to true.

```javascript

app.get('/someauthorizedpath',
  auth.isInRole('Super Admin'),
  function (req, res) {
    ...
  }
);

app.get('/someauthorizedpath',
  auth.isInRole(['Super Admin', 'Content Editor']),
  function (req, res) {
    ...
  }
);

```

#### auth.isInAnyRole(string | number | array)

This method validates against one or more specified roles. If multiple roles specified, only one should evaluate to true.

```javascript

app.get('/someauthorizedpath',
  auth.isInAnyRole('Super Admin'),
  function (req, res) {
      ...
  }
);

app.get('/someauthorizedpath',
  auth.isInAnyRole(['Super Admin', 'Content Editor']),
  function (req, res) {
      ...
  }
);

```

#### auth.hasPermission(string | number | array)

This method validates against one or more specified permissions. If multiple permissions specified, all should evaluate to true.

```javascript

app.get('/someauthorizedpath',
  auth.hasPermission('canEditContent'),
  function (req, res) {
    ...
  }
);

app.get('/someauthorizedpath',
  auth.hasPermission(['canEditContent', 'canDeleteContent']),
  function (req, res) {
    ...
  }
);

```

#### auth.hasAnyPermission(string | number | array)

This method validates against one or more specified roles. If multiple roles specified, only one should evaluate to true.

```javascript

app.get('/someauthorizedpath',
  auth.hasAnyPermission('canEditContent'),
  function (req, res) {
      ...
  }
);

app.get('/someauthorizedpath',
  auth.hasAnyPermission(['canEditContent', 'canRemoveContent']),
  function (req, res) {
      ...
  }
);

```

### Runtime check and strategies

Express-authorization will register its four authorization check functions into the request object for providing runtime evaluation and authorization strategies.  
**Note:** in case where the "bindToProperty" option is used, the functions will be registered to the request's specified object.  
**Note:** this functions will only be available after hooking up the library to the pipeline.

```javascript
/*
 * Without bindToProperty
 */
app.get('/somepath',
  function (req, res, next) {
    ...
    /*
      * All function are sync and return tue or false;
      */
    var isAllowed = req.isInRole("Content Editor");
    ...
    var isAllowed = req.isInAnyRole(["Content Editor", "Auditor"]);
    ...
    var isAllowed = req.hasPermission(45);
    ...
    var isAllowed = req.hasAnyPermission(["canAddUser", "canUpdateUser"]);
    ...
  }
);

/*
 * With bindToProperty: user
 */
app.get('/somepath',
  function (req, res, next) {
    ...
    /*
      * All function are sync and return tue or false;
      */
    var isAllowed = req.user.isInRole("Content Editor");
    ...
    var isAllowed = req.user.isInAnyRole(["Content Editor", "Auditor"]);
    ...
    var isAllowed = req.user.hasPermission(45);
    ...
    var isAllowed = req.user.hasAnyPermission(["canAddUser", "canUpdateUser"]);
    ...
  }
);

```

## Tests

```shell

 > npm install
 > npm run test

```

## Contributing

- Clone the repo
- Make the required changes
- Modify/ add tests where required
- Ensure all tests succeed. *npm run test*
- Create PR.

## Credits

- Hernan Bazzino

## License

[The MIT License](https://opensource.org/licenses/MIT)

Copyright (c) 2017 Hernan Bazzino <[GitHub](https://github.com/ElChupi)> <[LinkedIN](https://www.linkedin.com/in/hernanbazzino)>

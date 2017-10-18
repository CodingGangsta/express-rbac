exports = module.exports = Store;

function Store() {
  // Mock data!
  var users = [
    {
      id: "0000-0000-0000-0001",
      name: "John Doe",
      email: "john@doe.com",
      roles: [
        {
          id: "0000-0000-0000-0001",
          name: "Content Admin"
        },
        {
          id: "0000-0000-0000-0002",
          name: "Audit Manager"
        }
      ],
      permissions: [
        {
          id: "0000-0000-0000-0001",
          name: "canAddUser"
        },
        {
          id: "0000-0000-0000-0002",
          name: "canViewReports"
        }
      ]
    },
    {
      id: "0000-0000-0000-0002",
      name: "Jane Doe",
      email: "jane@doe.com",
      roles: [
        {
          id: "0000-0000-0000-0002",
          name: "Audit Manager"
        },
        {
          id: "0000-0000-0000-0003",
          name: "User"
        }
      ],
      permissions: [
        {
          id: "0000-0000-0000-0003",
          name: "canAuditPeople"
        },
        {
          id: "0000-0000-0000-0004",
          name: "canDeleteUser"
        }
      ]
    }
  ];
  
  this.userGet = function(userId) {
    return new Promise(function(resolve, reject) {
      var usr = users.find(function(u) {
        return u.id === userId;
      });
      if(usr) {
        resolve(usr);
      } else {
        reject("Could not find user with id: " + userId);
      }
    });
  };

  this.userLogIn = function(email) {
    return new Promise(function(resolve, reject) {
      var usr = users.find(function(u) {
        return u.email === email;
      });
      if(usr) {
        resolve(usr);
      } else {
        reject("Could not find user with email: " + email);
      }
    })
  };
}
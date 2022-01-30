class User {
  constructor(email, password, id) {
    this.email = email;
    this.password = password;
    this.id = id;
  }

  getEmail() {
    return this.email;
  }

  getId() {
    return this.id;
  }

  getPassword() {
    return this.password;
  }

  setPassword(newPassword) {
    this.password = newPassword;
  }

  toString() {
    return this.email.trim();
  }
}

class UserManager {
  constructor() {
    this.users = {};
  }

  addUser(email, password, id) {
    const newUser = new User(email, password, id);
    this.users[`${newUser.getEmail()}`] = newUser;
  }

  removeUserByEmail(email) {
    if (this.users[`${email}`]) {
      delete this.users[`${email}`];
    }
  }

  removeUserById(id) {
    for (let u in this.users) {
      const user = this.users[u];
      if ((id = user.getId())) {
        delete this.users[`${user.getEmail()}`];
        return;
      }
    }
  }

  getUserByEmail(email) {
    if (this.users[`${email}`]) {
      return this.users[`${email}`];
    }
    return null;
  }

  getUserById(id) {
    for (let u in this.users) {
      const user = this.users[u];
      if (id == user.getId()) {
        return user;
      }
    }
    return null;
  }

  getUsers() {
    let users = [];
    if (Object.keys(this.users).length > 0) {
      for (let u in this.users) {
        const user = this.users[u];
        users.push(user);
      }
      return users;
    }
    return null;
  }
}

const userman = UserManager;

export default userman;

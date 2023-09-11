
class User {

    constructor(obj) {
        this.email = obj.email;
        this.hashedPassword = obj.hashedPassword;
        this.firstName = obj.firstName;
        this.lastName = obj.lastName;
    }

}

module.exports = User;
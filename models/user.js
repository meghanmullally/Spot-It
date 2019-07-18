var bcrypt = require("bcryptjs");

module.exports = function (sequelize, DataTypes) {

    var modelDefinition = {
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    };

    var modelOptions = {
        hooks: {
            beforeCreate: hashPassword,
            beforeUpdate: rehashPassword
        }
    };

    function hashPassword (user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    };
    function rehashPassword (user) {
        console.log("rehashPassword", user);

        if (user.changed("password") && user.password) {
            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
        }
    };
    function hashBulkPassword (users) {
        console.log(users);
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (user.password) {
                user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
            }
        }
    };

    var User = sequelize.define("User", modelDefinition, modelOptions);
    
    User.prototype.isPasswordValid = function (password) {
        return bcrypt.compareSync(password, this.password);
    }

    return User;
};
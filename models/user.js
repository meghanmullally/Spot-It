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
            unique: true,
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
            beforeUpdate: hashPassword,
            beforeUpsert: hashPassword
        }
    };

    function hashPassword (user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }

    var User = sequelize.define("User", modelDefinition, modelOptions);
    
    User.prototype.isPasswordValid = function (password) {
        return bcrypt.compareSync(password, this.password);
    }

    return User;
};
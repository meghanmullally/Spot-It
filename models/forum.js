module.exports = function(sequelize, DataTypes) {
  var Forum = sequelize.define("Forum", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,50]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1,200]
      }
    }
  });
  return Forum;
  };


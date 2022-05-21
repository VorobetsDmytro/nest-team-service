'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('User', {
			id: {
				type: Sequelize.STRING,
				unique: true,
				primaryKey: true
			},
			email: {
				type: Sequelize.STRING,
				unique: true,
				allowNull: false
			},
			login: {
				type: Sequelize.STRING,
				unique: true,
				allowNull: false,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: ''
			},
			firstName: {
				type: Sequelize.STRING,
				allowNull: false
			},
			lastName: {
				type: Sequelize.STRING,
				allowNull: true
			},
			isGoogleAccount: {
				type: Sequelize.BOOLEAN,
        		defaultValue: false
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('User');
	}
};
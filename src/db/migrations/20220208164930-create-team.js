'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Team', {
			id: {
				type: Sequelize.STRING,
				unique: true,
				primaryKey: true
			},
			teamName: {
				type: Sequelize.STRING,
				unique: true,
				allowNull: false
			},
			managerId: {
				type: Sequelize.STRING,
				unique: true,
				allowNull: true
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Team');
	}
};
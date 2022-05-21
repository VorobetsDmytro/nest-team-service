'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('ResetToken', {
			value: {
				type: Sequelize.STRING,
				unique: true,
				primaryKey: true,
				allowNull: false
			},
			userId:{
				type: Sequelize.STRING
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('ResetToken');
	}
};
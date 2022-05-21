'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Role', {
			id: {
				type: Sequelize.STRING,
				unique: true,
				primaryKey: true
			},
			value: {
				type: Sequelize.STRING,
        		allowNull: false
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Role');
	}
};
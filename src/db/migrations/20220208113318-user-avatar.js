'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('User', 'avatar', { type: Sequelize.STRING })
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('User', 'avatar');
	}
};

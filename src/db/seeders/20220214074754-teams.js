'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('Team', [
			{ id: '1', teamName: 'team1', managerId: '8' },
			{ id: '2', teamName: 'team2', managerId: '9' },
			{ id: '3', teamName: 'team3', managerId: '10' },
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('Team', null, {});
	}
};

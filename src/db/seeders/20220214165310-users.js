'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('User', [
			{ id: '1', email: 'admin@test.com', login: 'admin', password: await bcrypt.hash('admin', 5), firstName: 'Admin', lastName: 'Admin', roleId: '3' },
			{ id: '2', email: 'player1@test.com', login: 'player1', password: await bcrypt.hash('player1', 5), firstName: 'Player', lastName: 'Player', roleId: '1', teamId: '1' },
			{ id: '3', email: 'player2@test.com', login: 'player2', password: await bcrypt.hash('player2', 5), firstName: 'Player', lastName: 'Player', roleId: '1' , teamId: '1'},
			{ id: '4', email: 'player3@test.com', login: 'player3', password: await bcrypt.hash('player3', 5), firstName: 'Player', lastName: 'Player', roleId: '1', teamId: '2' },
			{ id: '5', email: 'player4@test.com', login: 'player4', password: await bcrypt.hash('player4', 5), firstName: 'Player', lastName: 'Player', roleId: '1', teamId: '2' },
			{ id: '6', email: 'player5@test.com', login: 'player5', password: await bcrypt.hash('player5', 5), firstName: 'Player', lastName: 'Player', roleId: '1', teamId: '3' },
			{ id: '7', email: 'player6@test.com', login: 'player6', password: await bcrypt.hash('player6', 5), firstName: 'Player', lastName: 'Player', roleId: '1', teamId: '3' },
			{ id: '8', email: 'manager1@test.com', login: 'manager1', password: await bcrypt.hash('manager1', 5), firstName: 'Manager', lastName: 'Manager', roleId: '2', teamId: '1' },
			{ id: '9', email: 'manager2@test.com', login: 'manager2', password: await bcrypt.hash('manager2', 5), firstName: 'Manager', lastName: 'Manager', roleId: '2', teamId: '2' },
			{ id: '10', email: 'manager3@test.com', login: 'manager3', password: await bcrypt.hash('manager3', 5), firstName: 'Manager', lastName: 'Manager', roleId: '2', teamId: '3' },
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('User', null, {});
	}
};

'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addConstraint('TeamRequest', {
			fields: ['userId'],
			type: 'foreign key',
			name: 'teamRequest-user-association',
			references: {
				table: 'User',
				field: 'id'
			},
			onUpdate: 'CASCADE',
        	onDelete: 'CASCADE'
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeConstraint('TeamRequest', 'teamRequest-user-association');
	}
};

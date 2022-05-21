'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addConstraint('TeamRequest', {
			fields: ['teamId'],
			type: 'foreign key',
			name: 'teamRequest-team-association',
			references: {
				table: 'Team',
				field: 'id'
			},
			onUpdate: 'CASCADE',
        	onDelete: 'CASCADE'
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeConstraint('TeamRequest', 'teamRequest-team-association');
	}
};

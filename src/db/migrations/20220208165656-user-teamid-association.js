'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('User', 'teamId', { 
			type: Sequelize.STRING,
			allowNull: true,
			references: {
				model: 'Team',
				key: 'id'
			},
			onUpdate: 'CASCADE',
        	onDelete: 'CASCADE'
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('User', 'teamId');
	}
};

'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('User', 'roleId', { 
			type: Sequelize.STRING,
			allowNull: false,
			references: {
				model: 'Role',
				key: 'id'
			},
			onUpdate: 'CASCADE',
        	onDelete: 'CASCADE'
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('User', 'roleId');
	}
};
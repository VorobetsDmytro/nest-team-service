'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('TeamRequestApprovement', {
			id: {
				type: Sequelize.STRING,
				unique: true,
				primaryKey: true
			},
			teamRequestId: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {         
					model: 'TeamRequest',
					key: 'id'
				},
				onUpdate: 'CASCADE',
        		onDelete: 'CASCADE'
			},
			fromTeamId: {
				type: Sequelize.STRING,
				allowNull: false
			},
			fromTeamApprove: {
				type: Sequelize.BOOLEAN, 
        		allowNull: true
			},
			toTeamId: {
				type: Sequelize.STRING,
				allowNull: false
			},
			toTeamApprove: {
				type: Sequelize.BOOLEAN, 
        		allowNull: true
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('TeamRequestApprovement');
	}
};
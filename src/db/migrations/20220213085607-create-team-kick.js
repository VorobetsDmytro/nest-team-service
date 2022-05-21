'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('TeamKick', {
			id: {
				type: Sequelize.STRING, 
				unique: true,
				primaryKey: true
			},
			userId:{
				type: Sequelize.STRING,
        		allowNull: false,
				references: {         
					model: 'User',
					key: 'id'
				},
				onUpdate: 'CASCADE',
        		onDelete: 'CASCADE'
			},
			teamId: {
				type: Sequelize.STRING,
        		allowNull: false,
				references: {         
					model: 'Team',
					key: 'id'
				},
				onUpdate: 'CASCADE',
        		onDelete: 'CASCADE'
			},
			kickReason: {
				type: Sequelize.STRING,
				allowNull: false
			},
			kickedBy: {
				type: Sequelize.STRING,
        		allowNull: false,
				references: {         
					model: 'User',
					key: 'id'
				},
				onUpdate: 'CASCADE',
        		onDelete: 'CASCADE'
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('TeamKick');
	}
};
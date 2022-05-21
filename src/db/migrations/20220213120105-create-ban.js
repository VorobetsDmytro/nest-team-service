'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Ban', {
			id: {
				type: Sequelize.STRING, 
				unique: true,
				primaryKey: true
			},
			userId: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {         
					model: 'User',
					key: 'id'
				},
				onUpdate: 'CASCADE',
        		onDelete: 'CASCADE'
			},
			banReason: {
				type: Sequelize.STRING,
        		allowNull: false
			},
			bannedBy: {
				type: Sequelize.STRING,
        		allowNull: false,
				references: {         
					model: 'User',
					key: 'id'
				},
				onUpdate: 'CASCADE',
        		onDelete: 'CASCADE'
			},
			unBannedAt: {
				allowNull: true,
				type: Sequelize.DATE
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
		await queryInterface.dropTable('Ban');
	}
};
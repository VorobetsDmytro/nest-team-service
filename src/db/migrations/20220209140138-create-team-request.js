'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('TeamRequest', {
			id: {
				type: Sequelize.STRING, 
				unique: true,
				primaryKey: true
			},
			requestType: {
				type: Sequelize.STRING,
        		allowNull: false
			},
			userId: {
				type: Sequelize.STRING,
				allowNull: false
			},
			teamId: {
				type: Sequelize.STRING,
        		allowNull: false
			},
			status: {
				type: Sequelize.STRING,
        		allowNull: false
			},
			createdAt: Sequelize.DATE,
      		updatedAt: Sequelize.DATE
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('TeamRequest');
	}
};
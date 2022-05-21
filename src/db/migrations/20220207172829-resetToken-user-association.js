'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addConstraint('ResetToken', {
			fields: ['userId'],
			type: 'foreign key',
			name: 'resetToken_user_association',
			references: {
				table: 'User',
				field: 'id'
			},
			onUpdate: 'CASCADE',
        	onDelete: 'CASCADE'
		})
	},

	async down(queryInterface, Sequelize) {
		await  queryInterface.removeConstraint('ResetToken', 'resetToken_user_association');
	}
};

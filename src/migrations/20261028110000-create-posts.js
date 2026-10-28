'use strict'

/**
 * Bảng `posts` (Postgres) — tên cột camelCase, mỗi user có nhiều post. Hạn chế ràng buộc ở DB:
 * cột nghiệp vụ nullable, `userId` chỉ có index (không foreign key).
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING(255),
      },
      content: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })

    await queryInterface.addIndex('posts', ['userId'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('posts')
  },
}

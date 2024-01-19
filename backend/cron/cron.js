const cron = require('node-cron');
const Message = require('../models/messageModel');
const ArchivedMessage = require('../models/archivedMessage');
const { Op } = require('sequelize');

module.exports = function archiveMessages() {

  
  cron.schedule('0 0 * * *', async () => {
    try {

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate()-1);

      console.log(oneDayAgo);

      const oldMessages = await Message.findAll({
        where: {
          createdAt: {
            [Op.lt]: oneDayAgo,
          },
        },
      });

      if (oldMessages.length > 0) {
        // console.log(oldMessages.map((msg) => msg.toJSON()));
        await ArchivedMessage.bulkCreate(oldMessages.map((msg) => msg.toJSON()));
        await Message.destroy({
          where: {
            createdAt: {
              [Op.lt]: oneDayAgo,
            },
          },
        });
      }
    }catch (error) {
      console.error('Error archiving messages:', error);
    }
  });
};
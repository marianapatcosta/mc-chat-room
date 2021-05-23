const emoji = require("node-emoji");
const { smilesToEmojis } = require("../constants");

const convertToEmoji = message => {
    let smiles = Object.keys(smilesToEmojis);
    smiles.forEach(smile => (message = message.replace(smile, smilesToEmojis[smile])));
    return message;
};
  
const generateMessage = (username, text) => {
    text = emoji.emojify(convertToEmoji(text));
    return {
        username,
        text,
        createdAt: new Date().getTime()
    };
};

const generateLocationMessage = (username, locationUrl) => {
  return {
    username,
    locationUrl,
    createdAt: new Date().getTime()
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage
};

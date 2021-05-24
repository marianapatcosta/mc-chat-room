const emoji = require('node-emoji');
const { SMILES_TO_EMOJIS } = require('../constants');

const convertToEmoji = message => {
    let smiles = Object.keys(SMILES_TO_EMOJIS);
    smiles.forEach(smile => (message = message.replace(smile, SMILES_TO_EMOJIS[smile])));
    return message;
};
  
const generateMessage = (username, text) => {
    text = emoji.emojify(convertToEmoji(text));
    return {
        username,
        text,
        createdAt: new Date().getTime(),
    };
};

const generateLocationMessage = (username, locationUrl) => ({
    username,
    locationUrl,
    createdAt: new Date().getTime()
});

const generateImageMessage = (username, imageSrc) => ({
    username,
    imageSrc,
    createdAt: new Date().getTime()
});

module.exports = {
  generateMessage,
  generateLocationMessage,
  generateImageMessage
};


const SMILES_TO_EMOJIS = {
  ':D': ':smiley:',
  ':)': ':slightly_smiling_face:',
  ':(': ':slightly_frowning_face:',
  ';)': ':wink:',
  '(:': ':upside_down_face:',
  '|-(': ':face_with_rolling_eyes:',
  ':p': ':stuck_out_tongue:',
  '8)': ':sunglasses:',
  '8o': ':astonished:',
  ':o': ':open_mouth:',
  '(devil)': ':smiling_imp:',
  '(kiss)': ':kissing:',
  ':/': ':confused:',
  ';(': ':cry:',
  '(blush)': ':blush:',
  '(stareyes)': ':grinning_face_with_star_eyes:',
  '(hearteyes)': ':heart_eyes:',
  '</3': ':broken_heart:',
  '<3': ':heart:'
};

const CENSURED_WORDS = ['merda', 'foda-se', 'foder', 'caralho', 'piça', 'dick', 'shit', 'fuck', 'bitch']

module.exports = {
  SMILES_TO_EMOJIS,
  CENSURED_WORDS,
};
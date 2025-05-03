/**
 * Generates a consistent color based on a string (username)
 * @param {string} str - The string to generate color from
 * @returns {string} - A hex color code
 */
export const generateColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
};

/**
 * Gets an emoji based on the first letter of the username
 * @param {string} username - The username
 * @returns {string} - An emoji character
 */
export const getEmojiForUsername = (username) => {
  if (!username) return '😊';
  
  const firstChar = username.charAt(0).toLowerCase();
  const emojiMap = {
    'a': '😎', 'b': '🐻', 'c': '🍪', 'd': '🐶', 'e': '🦅',
    'f': '🦊', 'g': '🦍', 'h': '🐹', 'i': '🦔', 'j': '🃏',
    'k': '🦘', 'l': '🦁', 'm': '🐵', 'n': '🐢', 'o': '🦉',
    'p': '🐼', 'q': '👸', 'r': '🤖', 's': '🐍', 't': '🐯',
    'u': '🦄', 'v': '🧛', 'w': '🐺', 'x': '❌', 'y': '🧠',
    'z': '🧟'
  };
  
  return emojiMap[firstChar] || '😊';
};

/**
 * Generates an SVG profile picture with emoji and background color
 * @param {string} username - The username
 * @param {number} size - Size of the SVG in pixels
 * @returns {string} - SVG data URI
 */
export const generateProfilePicture = (username, size = 200) => {
  if (!username) return null;
  
  const backgroundColor = generateColor(username);
  const emoji = getEmojiForUsername(username);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size/2}" ry="${size/2}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="${size/2}">${emoji}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * Gets a profile picture URL (custom or generated)
 * @param {Object} user - User object
 * @returns {string} - Profile picture URL
 */
export const getProfilePicture = (user) => {
  if (!user) return null;
  
  // If user has a custom profile picture, use it
  if (user.profilePic && user.profilePic.trim() !== '') {
    return user.profilePic;
  }
  
  // Otherwise generate one based on username
  return generateProfilePicture(user.username);
};
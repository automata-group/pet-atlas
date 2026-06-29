const host = window.location.hostname;
const protocol = window.location.protocol;

export const API_URL = host === 'localhost' || host === '127.0.0.1'
  ? 'http://localhost:3000'
  : (host.includes('pet-atlas.com') ? `${protocol}//api.pet-atlas.com` : `${protocol}//${host}/api`);

export const SOCKET_URL = host === 'localhost' || host === '127.0.0.1'
  ? 'http://localhost:3000/chat'
  : (host.includes('pet-atlas.com') ? `${protocol}//api.pet-atlas.com/chat` : `${protocol}//${host}/api/chat`);


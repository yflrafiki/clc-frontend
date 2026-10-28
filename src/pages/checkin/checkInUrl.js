// The page the QR code points to. On a local dev server, point at the live site,
// because a phone can't open the computer's localhost.
const LIVE_SITE = 'https://lifeway-church.netlify.app';

const isLocal = () => ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const checkInUrl = () => `${isLocal() ? LIVE_SITE : window.location.origin}/checkin`;

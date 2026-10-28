import emailjs from '@emailjs/browser';
import { checkInUrl } from '../pages/checkin/checkInUrl';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const welcomeEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

// Sends the welcome email for a newly added member. The template variables are listed in .env.example.
export const sendWelcomeEmail = (member) =>
  emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_name: member.full_name,
    first_name: member.full_name?.split(' ')[0] || member.full_name,
    to_email: member.email,
    member_id: member.membership_id,
    church_name: 'LifeWay Church',
    check_in_url: checkInUrl(),
  }, { publicKey: PUBLIC_KEY });

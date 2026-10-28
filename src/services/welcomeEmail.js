import emailjs from '@emailjs/browser';
import { checkInUrl } from '../pages/checkin/checkInUrl';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const welcomeEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

// Sends the welcome email for a newly added member. The template variables are listed in .env.example.
// name, time and message also fill EmailJS's default "Contact Us" template, so it never arrives blank.
export const sendWelcomeEmail = (member) => {
  const firstName = member.full_name?.split(' ')[0] || member.full_name;

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_name: member.full_name,
    first_name: firstName,
    to_email: member.email,
    member_id: member.membership_id,
    church_name: 'LifeWay Church',
    check_in_url: checkInUrl(),
    name: member.full_name,
    time: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    message: `Dear ${firstName}, welcome to LifeWay Church! Your member ID is ${member.membership_id}. `
      + `When you come to church, scan the QR code at the entrance and enter this ID to mark yourself present: ${checkInUrl()}`,
  }, { publicKey: PUBLIC_KEY });
};

// Simple test script to check email functionality
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('Testing Resend email functionality...');

  // Check environment variables
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'Not set');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing');
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Campus Portal <notifications@piemaka.resend.app>',
      to: ['test@example.com'], // Replace with your email for testing
      subject: 'Test Email from Campus Portal',
      html: '<p>This is a test email to verify Resend configuration.</p>',
    });

    if (error) {
      console.error('❌ Email sending failed:', error);
    } else {
      console.log('✅ Email sent successfully:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();

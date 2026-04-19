// ═══════════════════════════════════════════════════
// EMAIL NOTIFICATION UTILITY
// Uses Nodemailer — install: npm install nodemailer
// ═══════════════════════════════════════════════════
const nodemailer = require('nodemailer');

// Create transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'burhanasghar12345@gmail.com',
        pass: process.env.EMAIL_PASS || 'zxho pmmu yvwy wypa'
    }
});

// ── Send Booking Confirmation to Client ──
async function sendBookingConfirmation(booking) {
    const mailOptions = {
        from: `"Smart Venues" <${process.env.EMAIL_USER}>`,
        to: booking.client_email,
        subject: `Booking Confirmed — ${booking.booking_ref} | Smart Venues`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f7f4; padding: 0;">
            <div style="background: #2c3e2d; padding: 32px; text-align: center;">
                <h1 style="color: #d4af37; font-family: Georgia, serif; margin: 0; font-size: 28px;">Smart Venues</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px; letter-spacing: 2px;">WEDDING SPECIALISTS</p>
            </div>
            <div style="padding: 40px 32px; background: white;">
                <h2 style="color: #2c3e2d; font-family: Georgia, serif; font-size: 24px; margin-bottom: 8px;">Booking Request Received! 💍</h2>
                <p style="color: #666; margin-bottom: 28px;">Dear <strong>${booking.client_name}</strong>, thank you for choosing Smart Venues. Your booking request has been received and our team will contact you within 24 hours.</p>
                
                <div style="background: #f9f7f4; border-radius: 8px; padding: 24px; margin-bottom: 28px;">
                    <h3 style="color: #2c3e2d; margin: 0 0 16px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #e8e4dc;">
                            <td style="padding: 10px 0; color: #888; font-size: 13px; width: 40%;">Booking Reference</td>
                            <td style="padding: 10px 0; color: #2c3e2d; font-weight: bold; font-size: 14px;">${booking.booking_ref}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e8e4dc;">
                            <td style="padding: 10px 0; color: #888; font-size: 13px;">Client Name</td>
                            <td style="padding: 10px 0; color: #2c3e2d; font-size: 14px;">${booking.client_name}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e8e4dc;">
                            <td style="padding: 10px 0; color: #888; font-size: 13px;">Wedding Date</td>
                            <td style="padding: 10px 0; color: #2c3e2d; font-size: 14px;">${booking.wedding_date || 'To be confirmed'}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e8e4dc;">
                            <td style="padding: 10px 0; color: #888; font-size: 13px;">Guest Count</td>
                            <td style="padding: 10px 0; color: #2c3e2d; font-size: 14px;">${booking.guest_count || 'To be confirmed'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #888; font-size: 13px;">Status</td>
                            <td style="padding: 10px 0;"><span style="background: #fff3cd; color: #856404; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">PENDING CONFIRMATION</span></td>
                        </tr>
                    </table>
                </div>

                <div style="background: #2c3e2d; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px; line-height: 1.6;">
                        <strong style="color: #d4af37;">Next Steps:</strong><br>
                        Our wedding specialist will call you within <strong style="color: white;">24 hours</strong> to discuss your requirements, confirm availability and arrange a site visit.
                    </p>
                </div>

                <p style="color: #888; font-size: 13px; margin: 0;">Questions? Contact us at <a href="mailto:hello@smartvenues.com" style="color: #2c3e2d;">hello@smartvenues.com</a> or call <strong>+92 42 111 000 000</strong></p>
            </div>
            <div style="background: #f9f7f4; padding: 20px 32px; text-align: center; border-top: 1px solid #e8e4dc;">
                <p style="color: #aaa; font-size: 12px; margin: 0;">© 2026 Smart Venues · Main Boulevard Gulberg, Lahore</p>
            </div>
        </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Booking confirmation email sent to ${booking.client_email}`);
        return true;
    } catch (err) {
        console.error('❌ Email send failed:', err.message);
        return false;
    }
}

// ── Send Status Update Email ──
async function sendStatusUpdate(booking, newStatus) {
    const statusColors = {
        confirmed: { bg: '#d4edda', text: '#155724', label: 'CONFIRMED ✅' },
        cancelled:  { bg: '#f8d7da', text: '#721c24', label: 'CANCELLED ❌' },
        pending:    { bg: '#fff3cd', text: '#856404', label: 'PENDING ⏳' }
    };
    const s = statusColors[newStatus] || statusColors.pending;

    const mailOptions = {
        from: `"Smart Venues" <${process.env.EMAIL_USER}>`,
        to: booking.client_email,
        subject: `Booking ${newStatus.toUpperCase()} — ${booking.booking_ref} | Smart Venues`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2c3e2d; padding: 32px; text-align: center;">
                <h1 style="color: #d4af37; font-family: Georgia, serif; margin: 0;">Smart Venues</h1>
            </div>
            <div style="padding: 40px 32px; background: white;">
                <h2 style="color: #2c3e2d; font-family: Georgia, serif;">Booking Status Update</h2>
                <p>Dear <strong>${booking.client_name}</strong>, your booking status has been updated.</p>
                <div style="background: ${s.bg}; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
                    <span style="color: ${s.text}; font-weight: bold; font-size: 18px;">${s.label}</span>
                </div>
                <p><strong>Booking Ref:</strong> ${booking.booking_ref}</p>
                <p><strong>Wedding Date:</strong> ${booking.wedding_date || 'TBD'}</p>
                ${newStatus === 'confirmed' ? '<p style="color: #155724;">🎉 Congratulations! Please arrange a 20% advance payment to secure your booking.</p>' : ''}
                <p style="color: #888; font-size: 13px;">Contact us: <a href="mailto:hello@smartvenues.com">hello@smartvenues.com</a> | +92 42 111 000 000</p>
            </div>
        </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Status update email sent to ${booking.client_email}`);
        return true;
    } catch (err) {
        console.error('❌ Status email failed:', err.message);
        return false;
    }
}

// ── Send Contact Form Acknowledgement ──
async function sendContactAck(contact) {
    const mailOptions = {
        from: `"Smart Venues" <${process.env.EMAIL_USER}>`,
        to: contact.email,
        subject: `We received your enquiry — Smart Venues`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2c3e2d; padding: 32px; text-align: center;">
                <h1 style="color: #d4af37; font-family: Georgia, serif; margin: 0;">Smart Venues</h1>
            </div>
            <div style="padding: 40px 32px; background: white;">
                <h2 style="color: #2c3e2d; font-family: Georgia, serif;">Thank you for reaching out! 🌿</h2>
                <p>Dear <strong>${contact.name}</strong>, we have received your enquiry and a specialist will contact you within <strong>24 hours</strong>.</p>
                <p style="color: #888; font-size: 13px;">Smart Venues · hello@smartvenues.com · +92 42 111 000 000</p>
            </div>
        </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error('❌ Contact ack email failed:', err.message);
        return false;
    }
}

module.exports = { sendBookingConfirmation, sendStatusUpdate, sendContactAck };

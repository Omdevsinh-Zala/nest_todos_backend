import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Use Gmail service with App Password
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendBaseUrl}/verify-email?token=${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Todo App" <${process.env.SMTP_USER || 'noreply@todoapp.com'}>`,
      to,
      subject: 'Verify your email address - Todo App',
      text: `Please verify your email by clicking on the following link: ${verifyUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Todo App!</h2>
          <p>Thank you for registering. Please click the button below to verify your email address:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>Or copy and paste this link in your browser: <br/> <a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>This link will expire in 30 minutes.</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent: %s', info.messageId);
      
      // If using ethereal email, this prints a link to preview the message
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Depending on your requirements, you might want to rethrow or just log the error
    }
  }
}

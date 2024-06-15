const nodemailer = require("nodemailer");

exports.customEmail = async (email, subject, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env?.FROM_EMAIL,
        pass: process.env?.EMAIL_APP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env?.FROM_EMAIL,
      to: email,
      subject: subject,
      html: body,
    });
    console.log("Email Sent Successfully To: ", email);
  } catch (error) {
    console.error("Error Sending Email:", error);
  }
};

exports.emailVerification = async (email, verificationLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env?.FROM_EMAIL,
        pass: process.env?.EMAIL_APP_PASS,
      },
    });

    const emailBody = `
      <p>Hi,</p>
      <p>You created an account on Market Wizards. You are just one step away from completing your registration. Please click the following link to verify your account:</p>
      <p><a href="${verificationLink}">Verify Your Account</a></p>
      <p>If you did not create the account, please ignore this email.</p>
      <p>Thank you,</p>
      <p>The Market Wizards Team</p>
    `;

    await transporter.sendMail({
      from: process.env?.FROM_EMAIL,
      to: email,
      subject: "Account Verification",
      html: emailBody,
    });

    console.log("Email Sent Successfully To:", email);
  } catch (error) {
    console.error("Error Sending Email:", error);
  }
};

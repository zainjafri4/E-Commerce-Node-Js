const nodemailer = require("nodemailer");

exports.customEmail = async (email, subject, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: "<Emaill Address>", // Your Gmail address
        pass: "<Password>", // Your app password
      },
    });

    await transporter.sendMail({
      from: "<Email Address>", // Your email address
      to: email,
      subject: subject,
      text: body,
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
        user: "<Email Address>", // Your Gmail address
        pass: "<Password>", // Your app password
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
      from: "<Email Address>", // Your email address
      to: email,
      subject: "Account Verification",
      html: emailBody,
    });

    console.log("Email Sent Successfully To:", email);
  } catch (error) {
    console.error("Error Sending Email:", error);
  }
};

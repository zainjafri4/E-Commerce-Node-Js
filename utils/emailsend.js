const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, body) => {
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

module.exports = sendEmail;

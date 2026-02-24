const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "Oauth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

//verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.log("error connecting to the mail server", error);
    } else {
        console.log("email server is ready to send message ");
    }
});

//function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend ledger" <${process.env.EMAIL_USER}>`, //sender address
            to, //list of recivers
            subject, //subject line
            text, //plain text body
            html, //html body
        });

        console.log("message sent %s", info.messageId);
        console.log("preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.log("error sending message ", error);
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to Backend Ledger!";
    const text = `Hello ${name}, In\nThank you for registering at Backend Ledger.
                We're excited to have you on board! \n\nBest regards, \nThe Backend Ledger Team' ;
                const html = '<p>Hello ${name}, </p><p>Thank you for registering at Backend
                Ledger. We're excited to have you on board !< /p><p>Best regards, <br>The Backend
                Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
}

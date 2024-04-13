import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aakashprajapati000001@gmail.com',
        pass: 'vqvrdsnjsuoxgikg',
    },
});

const mailSender = async (email, text) => {
    const mailOptions = {
        from: 'aakashprajapati000001@gmail.com',
        to: email,
        subject: 'Verification Code',
        text: text,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            console.log("some error in main sender");
        } else {
            console.log("mail send for varification");
        }
    });
};

export default mailSender;
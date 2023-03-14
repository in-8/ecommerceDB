/**
 *
 * Run:
 *
 */
const Mailjet = require('node-mailjet')
const mailjet = Mailjet.apiConnect(
    "306f252666fbea68382f6f73b626175e",
    "980953cadfcb67c45f9921c64069d26a"
  )


module.exports = function(email,token, callback){
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
            From: {
                Email: 'vinit.sharma@ssipmt.com',
                Name: 'Lelo.com',
            },
            To: [
                {
                Email: email,
                Name: 'customer',
                },
            ],
            Subject: 'reset password link for lelo for lelo',
            TextPart: 'click on the link below to reset your Lelo account password',
            HTMLPart:
                `<h3> <a href="http://localhost:3000/resetPassword/${token}/${email}">click here</a></h3>`,
            },
        ],
        })

        request
        .then(result => {
            callback(null,result.body);
        })
        .catch(err => {
            console.log(err);
            callback(err,null);
        })
}

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
            Subject: 'email verifiaction for lelo',
            TextPart: 'thankyou for joining lelo family! click on the link below to get verified.',
            HTMLPart:
                `<h3> hi click on this link to get verified!</h3> <a href="http://localhost:3000/verifyMail/${token}/${email}">verify here</a>`,  
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

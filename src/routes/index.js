const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

const Ad = require('../models/Ad');
const User = require('../models/User');

const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contact.instaads@gmail.com',
    pass: 'Serra*99'
  }
});

// Welcome Page
router.get('/', forwardAuthenticated, async (req, res) => {
  const {minp, maxp, niche, type, minh, minf, maxf} = req.query;
  console.log(req.query);
  var query = {};
  if (minp != '' && minp != undefined && maxp != '' && maxp != undefined) {
    query = Object.assign({}, {'price': {$lt: maxp, $gt: minp} } , query);
  }
  else if (minp != '' && minp != undefined) query = Object.assign({}, {'price': {$gt: minp} } , query);
  else if (maxp != '' && maxp != undefined) query = Object.assign({}, {'price': {$lt: maxp} } , query);


  if (niche != undefined) query = Object.assign({}, {'niche': niche } , query);

  if (type != undefined) {
    query = Object.assign({}, {'type': type } , query);
    if (type == 'post' && minh != '' && minh != undefined) {
      query = Object.assign({}, {'hours': {$gt: minh} } , query);
    }
  }


  if (minf != '' && minf != undefined && maxf != '' && maxf != undefined) {
    query = Object.assign({}, {'followers': {$lt: maxf, $gt: minf} } , query);
  }
  else if (minf != '' && minf != undefined) query = Object.assign({}, {'followers': {$gt: minf} } , query);
  else if (maxf != '' && maxf != undefined) query = Object.assign({}, {'followers': {$lt: maxf} } , query);


  //console.log(query);
  //const result = Object.assign({}, primer, segon);  const {minp, maxp} = req.query;
  //if (minp != '') ad = ad.find({'price': {$gt: minp} })
  //if (maxp != '') ad = ad.find({'price': {$gt: maxp} })
  const ad = await Ad.find(query);
  res.render('nou-getpromoted-sense-registrar', {
    user: req.user,
    ad
  })
});
/*
// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.redirect('/');
);*/
//get promoted
router.get('/getpromoted', ensureAuthenticated, async (req, res) => {
  const {minp, maxp, niche, type, minh, minf, maxf} = req.query;
  console.log(req.query);
  var query = {};
  if (minp != '' && minp != undefined && maxp != '' && maxp != undefined) {
    query = Object.assign({}, {'price': {$lt: maxp, $gt: minp} } , query);
  }
  else if (minp != '' && minp != undefined) query = Object.assign({}, {'price': {$gt: minp} } , query);
  else if (maxp != '' && maxp != undefined) query = Object.assign({}, {'price': {$lt: maxp} } , query);


  if (niche != undefined) query = Object.assign({}, {'niche': niche } , query);

  if (type != undefined) {
    query = Object.assign({}, {'type': type } , query);
    if (type == 'post' && minh != '' && minh != undefined) {
      query = Object.assign({}, {'hours': {$gt: minh} } , query);
    }
  }


  if (minf != '' && minf != undefined && maxf != '' && maxf != undefined) {
    query = Object.assign({}, {'followers': {$lt: maxf, $gt: minf} } , query);
  }
  else if (minf != '' && minf != undefined) query = Object.assign({}, {'followers': {$gt: minf} } , query);
  else if (maxf != '' && maxf != undefined) query = Object.assign({}, {'followers': {$lt: maxf} } , query);


  //console.log(query);
  //const result = Object.assign({}, primer, segon);  const {minp, maxp} = req.query;
  //if (minp != '') ad = ad.find({'price': {$gt: minp} })
  //if (maxp != '') ad = ad.find({'price': {$gt: maxp} })
  const ad = await Ad.find(query);
  res.render('nou-getpromoted', {
    user: req.user,
    ad
  })
});

//myads
router.get('/myads', ensureAuthenticated, async (req, res) => {
  const ad = await Ad.find({'username': req.user.email});

  res.render('nou-myads', {
    user: req.user,
    ad
  })
});
//myads borrar ad
router.get('/myads/:id', ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  const del = await Ad.deleteOne({_id: id});
  const ad = await Ad.find({'username': req.user.email});
  res.render('nou-myads', {
    user: req.user,
    ad
  })
});

//promoted
router.get('/promote', ensureAuthenticated, (req, res) =>
  res.render('nou-promote', {
    user: req.user
  })
);
//promoted post
router.post('/promote', ensureAuthenticated, async (req, res) => {
  var { ig_username, followers, niche, type, hours, price, payment, username } = req.body;
  const user = await User.findOne( {'email': username} );
  if (user.type == 'sense-confirmar') {
    const ad = await Ad.find({'username': username});
    if (ad.length == 0) {
      if (payment == 'cross promotion') price = -1;
      if (type == 'storie') hours = -1;
      const newAd = new Ad({
        ig_username,
        followers,
        niche,
        type,
        hours,
        price,
        payment,
        username
      });
      newAd.save();
      console.log(newAd);
    }
  }
  else if (user.type == 'confirmat') {
    const ad = await Ad.find({'username': username});
    if (ad.length < 3) {
      if (payment == 'cross promotion') price = -1;
      if (type == 'storie') hours = -1;
      const newAd = new Ad({
        ig_username,
        followers,
        niche,
        type,
        hours,
        price,
        payment,
        username
      });
      newAd.save();
      console.log(newAd);
    }
  }
  res.redirect('/myads');
});

//myads
router.get('/users/confirm/:id', async (req, res) => {
  const id = req.params.id;
  const user = await User.updateOne({'_id': id}, {$set: { 'type': 'confirmat' }});
  res.redirect('/');
});
//lost password
router.get('/users/forgotpassword', async (req, res) => {
  res.render('nou-forgotpassword')
});
router.post('/users/forgotpassword/', async (req, res) => {
  const user = await User.findOne({'email':req.body.email})
  enviarMail(user.email, user.id);
  res.redirect('/');
});
router.post('/users/changepassword/:reqtime/:id', async (req,res) => {
  const reqtime = req.params.reqtime;
  const id = req.params.id;
  var {newPass, newPassSec} = req.body;
  console.log(req.body);
  const difft = Math.floor(reqtime/1000)-Math.floor(Date.now()/1000);
  if (newPass == newPassSec && difft < 10800) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newPass, salt, async (err, hash) => {
        if (err) throw err;
        newPass = hash;
        console.log(hash);
        const user = await User.updateOne({'_id': id}, {$set: { 'password': newPass}})
      });
    });
  }
  res.sendStatus(200);
})

function enviarMail(correu, id){
  const temps = Date.now();
  var mailOptions = {
    from: 'contact.instaads@gmail.com',
    to: correu,
    subject: 'NO REPLAY: Password recovery',
    html: '<head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Revue</title> <style type="text/css"> #outlook a {padding:0;} body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;} .ExternalClass {width:100%;} .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div, .ExternalClass blockquote {line-height: 100%;} .ExternalClass p, .ExternalClass blockquote {margin-bottom: 0; margin: 0;} #backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;} img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;} a img {border:none;} .image_fix {display:block;} p {margin: 1em 0;} button { background-color: #448c56; color: white; padding: 14px 20px; margin: 8px 0; border: none; cursor: pointer; width: 100%; } h1, h2, h3, h4, h5, h6 {color: black !important;} h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {color: black;} h1 a:active, h2 a:active, h3 a:active, h4 a:active, h5 a:active, h6 a:active {color: black;} h1 a:visited, h2 a:visited, h3 a:visited, h4 a:visited, h5 a:visited, h6 a:visited {color: black;} table td {border-collapse: collapse;} table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; } a {color: #3498db;} p.domain a{color: black;} hr {border: 0; background-color: #d8d8d8; margin: 0; margin-bottom: 0; height: 1px;} @media (max-device-width: 667px) { a[href^="tel"], a[href^="sms"] { text-decoration: none; color: blue; pointer-events: none; cursor: default; } .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] { text-decoration: default; color: orange !important; pointer-events: auto; cursor: default; } h1[class="profile-name"], h1[class="profile-name"] a { font-size: 32px !important; line-height: 38px !important; margin-bottom: 14px !important; } span[class="issue-date"], span[class="issue-date"] a { font-size: 14px !important; line-height: 22px !important; } td[class="description-before"] { padding-bottom: 28px !important; } td[class="description"] { padding-bottom: 14px !important; } td[class="description"] span, span[class="item-text"], span[class="item-text"] span { font-size: 16px !important; line-height: 24px !important; } span[class="item-link-title"] { font-size: 18px !important; line-height: 24px !important; } span[class="item-header"] { font-size: 22px !important; } span[class="item-link-description"], span[class="item-link-description"] span { font-size: 14px !important; line-height: 22px !important; } .link-image { width: 84px !important; height: 84px !important; } .link-image img { max-width: 100% !important; max-height: 100% !important; } } @media (max-width: 500px) { .column { display: block !important; width: 100% !important; padding-bottom: 8px !important; } } @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) { a[href^="tel"], a[href^="sms"] { text-decoration: none; color: blue; pointer-events: none; cursor: default; } .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] { text-decoration: default; color: orange !important; pointer-events: auto; cursor: default; } } </style> <!--[if gte mso 9]> <style type="text/css"> #contentTable { width: 600px; } </style> <![endif]--> </head> <body style="width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <table cellpadding="0" cellspacing="0" border="0" id="backgroundTable" style="margin:0; padding:0; width:100% !important; line-height: 100% !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;background-color: #F9FAFB;" width="100%"> <tbody><tr> <td width="10" valign="top">&nbsp;</td> <td valign="top" align="center"> <!--[if (gte mso 9)|(IE)]> <table width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF; border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <tr> <td> <![endif]--> <table cellpadding="0" cellspacing="0" border="0" align="center" style="width: 100%; max-width: 600px; background-color: #FFF; border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;" id="contentTable"> <tbody><tr> <td width="600" valign="top" align="center" style="border-collapse:collapse;"> <table align="center" border="0" cellpadding="0" cellspacing="0" style="background: #F9FAFB;" width="100%"> <tbody><tr> <td align="center" valign="top"> <div style="font-family: &quot;lato&quot;, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; line-height: 28px;">&nbsp;</div> </td> </tr> </tbody></table> <table align="center" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #E0E4E8;" width="100%"> <tbody><tr> <td align="center" style="padding: 56px 56px 28px 56px;" valign="top"> <h1 style="font-family: &quot;lato&quot;, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; line-height: 28px;font-size: 20px; color: #333;">Recover your account</h1></td> </tr> <tr> <td align="center" style="padding: 0 56px 28px 56px;" valign="top"> <div style="font-family: &quot;lato&quot;, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; line-height: 28px;font-size: 20px; color: #333;"><strong>Instructions:</strong> Insert a 6 digit password in both of the input fields and click submit new password <span>(a confirmation box might pop up) </span>. It will only be available for 3 hours.</div> </td> </tr> <tr> <td align="center" style="padding: 0 56px; padding-bottom: 56px;" valign="top"> <div><!--[if mso]> <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:40px;v-text-anchor:middle;width:270px;" arcsize="125%" stroke="f" fillcolor="#E15718"> <w:anchorlock/> <center> <![endif]--> <form action="http://instaads.net/users/changepassword/'+temps+'/'+id+'" method="POST"> <input type="password" id="password" name="newPass" placeholder="Enter Password" require /> <input type="password" id="password2" name="newPassSec" placeholder="Confirm Password" require /> <button type="submit"><h2>Confirm new password</h2></button> </form> <!---<a href="" style="margin-top:30px;background-color:#E15718;border-radius:50px;color:#ffffff;display:inline-block;font-family: Helvetica, Arial, sans-serif;font-size:18px;font-weight: bold;line-height:40px;text-align:center;text-decoration:none;width:270px;-webkit-text-size-adjust:none;" target="_blank">Submit new password</a>--> <!--[if mso]> </center> </v:roundrect> <![endif]--></div> </td> </tr> </tbody></table> <table align="center" border="0" cellpadding="0" cellspacing="0" style="background: #F9FAFB;" width="100%"> <tbody> <tr> <td align="center" style="padding: 0 56px 28px 56px;" valign="top"> <div style="font-family: &quot;lato&quot;, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; line-height: 28px;font-size: 16px; color: #A7ADB5;"> If you didn’t subscribe, simply delete this email. You won'+'t be subscribed if you don'+'t click the confirm button above. </div> </td> </tr> </tbody></table> </td> </tr> </tbody></table> <!--[if (gte mso 9)|(IE)]> </td> </tr> </table> <![endif]--> </td> <td width="10" valign="top">&nbsp;</td> </tr> </tbody></table> </body>'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = router;

const nodemailer = require("nodemailer");
const setting = require("../../../Config/mailer.setting.json");
module.exports = {
	/*
		targetUserMail:对方邮件地址 linyz@viomi.net,hexiaoming@viomi.com
		title:邮件标题
		content:邮件内容
	*/
	send : async function(targetUserMail,title,content){
		let transporter = nodemailer.createTransport({
			host: setting.host,
			secure: true,
			port: setting.port,
			auth: {
				user: setting.user,
				pass: setting.pass
			}
		});
		let info = await transporter.sendMail({
	    from: setting.user,
	    to: targetUserMail,
	    subject: title,
	    text: content
	  });
	  return info;
	}
};
// function(res, palletsn, data, title) {
// 	var transport = nodemailer.createTransport("SMTP", {
// 		host: "smtp.sina.com",
// 		secureConnection: true,
// 		secure: true,
// 		port: 465,
// 		auth: {
// 			user: "viomi_linyz@sina.com",
// 			pass: "viomi@2019"
// 		}
// 	});
// 	var buffer = xlsx.build([{
// 		name: "发货明细",
// 		data: data
// 	}]);
// 	transport.sendMail({
// 		from: "viomi_linyz@sina.com",
// 		to: "linyz@viomi.net;zousz@viomi.net;youliang@viomi.net;liaols@viomi.com.cn",
// 		subject: title || "机械水壶发货明细自动发送",
// 		generateTextFromHTML: true,
// 		html: palletsn + '板发货明细',
// 		attachments: [{
// 			'filename': palletsn + '.xlsx',
// 			'contents': buffer
// 		}]
// 	},function(error, response) {
// 		if(error) {
// 			console.log("email sent error",error);
// 			base.resError(res,error.message);
// 		} else {
// 			base.resSuccess(res);
// 		}
// 		transport.close();
// 	});
// }
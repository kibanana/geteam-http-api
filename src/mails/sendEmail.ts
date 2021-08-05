import nodemailer from 'nodemailer'
import AWS from 'aws-sdk'
import getContent from '@mails/contents'
import template from '@mails/templates'
import SendEmailParam from '@mails/interfaces/sendEmailParam'
import EmailType from '@common/constants/emailType'
import config from '@config'

// AWS.config.loadFromPath('./../aws.json')

export default async (emailType: EmailType, params: Partial<SendEmailParam>) => {
	try {
		const {
			email,

			// EmailType.Auth
			key,

			// EmailType.PasswordReset
			name,
			password,

			// EmailType.TeamCompleted
			kind,
			boardTitle,
			boardId,
			boardAuthor,

			// EmailType.Ask
			title,
			content // +) EmailType.TeamCompleted
		} = params

		const transporter = nodemailer.createTransport({
			// SES: new AWS.SES({
			//   apiVersion: '2010-12-01',
			// })
			service: 'Gmail',
			host :'smtp.gmlail.com',
			secure: false,
			auth: {
				user: process.env.EMAIL || config.EMAIL,
				pass: process.env.PWD || config.PWD,
			},
		})
	
		const mailOptions = {
			from: process.env.EMAIL || config.EMAIL,
			to: email,
			subject: '',
			html: ''
		}
	
		switch (emailType) {
			case EmailType.Auth:
				mailOptions.subject = 'Geteam 이메일 인증'
				mailOptions.html = template(
					'Geteam 이메일 인증용 링크',
					getContent(EmailType.Auth, { email, key }),
					'이메일 인증 완료',
					`http://127.0.0.1:3003/signup/verify/${key}`
				)
				break
			case EmailType.PasswordReset:
				mailOptions.subject = 'Geteam 비밀번호 초기화'
				mailOptions.html = template(
					'Geteam 비밀번호 초기화',
					getContent(EmailType.PasswordReset, { name, password }),
					'Geteam 바로가기',
					`http://127.0.0.1:3003/signin`
				)
				break
			case EmailType.TeamCompleted:
				mailOptions.subject = `Geteam 팀 모집 완료 : [${kind}] ${boardTitle}`
				mailOptions.html = template(
					`Geteam 팀 모집 완료`,
					getContent(EmailType.TeamCompleted, { boardAuthor: String(boardAuthor), content }),
					'모집글 바로가기',
					`http://127.0.0.1:3003/board/<${kind}/${boardId}`
				)
				break
			case EmailType.Ask:
				mailOptions.subject = `Geteam 문의사항 : ${title}`
				mailOptions.html = getContent(EmailType.Ask, { kind, title, content })
				break
			default:
				return
		}
	
		const info = await transporter.sendMail(mailOptions)
		console.log(`Message sent : ${info.response}`)
		transporter.close()
	}
	catch (err) {
		throw new Error(err)
	}
}

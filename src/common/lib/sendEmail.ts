import nodemailer from 'nodemailer'
import AWS from 'aws-sdk'
import emailForm from '@common/mails/emailForm'
import Board from '@models/entities/interfaces/board'
import config from '@config'

// AWS.config.loadFromPath('./../aws.json')

export const sendAuthEmail = async (email: string, key: string) => {
	try {
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

		const emailContent = `
			Geteam 계정에 등록하신 이메일 주소(${email})가 올바른지 확인하기 위한 이메일입니다.<br>
			아래의 버튼을 클릭하여 이메일 인증을 완료해주세요!<br>
			개인정보 보호를 위해 인증 링크는 하루동안만 유효합니다.<br>
			만약 인증 메일의 재발송을 원하신다면 <a href="http://127.0.0.1:3003/signup/verify/new/${key}?email=${email}" style="color: #efdc05;">이 링크</a>를 클릭해주세요!
		`
	
		const mailOptions = {
			from: process.env.EMAIL || config.EMAIL,
			to: email,
			subject: 'Geteam 이메일 인증',
			html: emailForm('Geteam 이메일 인증용 링크', emailContent, '이메일 인증 완료', `http://127.0.0.1:3003/signup/verify/${key}`),
		}

		const info = await transporter.sendMail(mailOptions)
		console.log(`Message sent : ${info.response}`)
		transporter.close()
		return true
	} catch (err) {
		throw new Error(err)
	}
}

export const sendPwdEmail = async (subject: string, email: string, name: string, tempPassword: string) => {
	try {
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

		const emailContent = `${name}님의 임시 비밀번호는 <span style="background: #efdc05;">${tempPassword}</span> 입니다.`
	
		const mailOptions = {
			from: process.env.EMAIL || config.EMAIL,
			to: email,
			subject: subject,
			html: emailForm('Geteam 비밀번호 초기화', emailContent, 'Geteam 바로가기', `http://127.0.0.1:3003/signin`),
		}

		const info = await transporter.sendMail(mailOptions)
		console.log(`Message sent : ${info.response}`)
		transporter.close()
		return true
	} catch (err) {
		throw new Error(err)
	}
}

export const sendQuestionEmail = async (kind: string, title: string, content: string) => {
	try {
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
	
		let message = content
		message = message.replace(/(?:\r\n|\r|\n)/g, '<br />')
		
		const mailOptions = {
			from: process.env.EMAIL || config.EMAIL,
			to: process.env.EMAIL || config.EMAIL,
			subject: `Geteam 문의사항 : ${title}`,
			html: `<h3>[${kind}] ${title}</h3> ${message}`,
		}
	
		const info = await transporter.sendMail(mailOptions)
		console.log(`Message sent : ${info.response}`)
		transporter.close()
		return true
	} catch (err) {
		throw new Error(err)
	}
}

export const sendTeamEmail = async (email: string, kind: string, item: Board, content: string) => {
	try {
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

		const message = content.replace(/(?:\r\n|\r|\n)/g, '<br />')
		const emailContent = `<h5>팀 모집자님(${item.author})이 보내셨습니다<h5><br>${message}`
	
		const mailOptions = {
			from: process.env.EMAIL || config.EMAIL,
			to: email,
			subject: `Geteam 팀 모집 완료 : [${kind}] ${item.title}`,
			html: emailForm(`Geteam 팀 모집 완료`, emailContent, '모집글 바로가기', `http://127.0.0.1:3003/board/<${kind}/${item._id}`),
		}
	
		const info = await transporter.sendMail(mailOptions)
		console.log(`Message sent : ${info.response}`)
		transporter.close()
		return true
	} catch (err) {
		throw new Error(err)
	}
}

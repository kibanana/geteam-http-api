import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import decodeJWT from 'jwt-decode'
import bcrypt from 'bcryptjs'
import { SuccessResponse, FailureResponse, InternalErrorResponse } from '@common/lib/response'
import { FAILURE_RESPONSE } from '@common/lib/failureResponse'
import { EmailType } from '@common/constants'
import { DecodedJwt } from '@common/interfaces'
import { createKey, createHash, redisClient } from '@common/lib'
import sendEmail from '@mails/index'
import AccountDB from '@models/account'
import config from '../../../config'

export const Create = async (req: Request, res: Response) => {
    try {
        const { id, name, pwd, sNum, interests, profile } = req.body

        if (!id || !name || !pwd || isNaN(sNum) || !interests || !Array.isArray(interests) || !profile) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const verifyKey = createKey()

        sendEmail(EmailType.Auth, { email: id, key: verifyKey })
            .catch((err: Error) => console.log(err))
    
        await AccountDB.DeleteBeforeSignUp({ id })
        await AccountDB.SignUp({ id, name, pwd, sNum, interests, profile, verifyKey })
        
        res.status(201).end(SuccessResponse())
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const CompareEmail = async (req: Request, res: Response) => {
    try {
        const { email: id } = req.body

        if (!id) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const result = await AccountDB.GetCompareEmail({ id })
    
        res.send(SuccessResponse({ result }))
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const CompareVerifyKey = async (req: Request, res: Response) => {
    try {
        const { email: id, key } = req.body

        if (!id || !key) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const result = await AccountDB.UpdateIsVerified({ id, verifyKey: key })
        if (result.matchedCount === 0) {
            return res.status(404).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }

        await redisClient.incCnt('accountCnt')
    
        res.send(SuccessResponse())
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const SetVerifyKey = async (req: Request, res: Response) => {
    try {
        const { email: id } = req.body

        if (!id) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const verifyKey = createKey()
        const result = await AccountDB.UpdateVerifyKey({ id, verifyKey })
        if (result.matchedCount === 0) {
            return res.status(404).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
    
        sendEmail(EmailType.Auth, { email: id, key: verifyKey })
            .catch((err: Error) => console.log(err))
    
        res.send(SuccessResponse())
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const SignIn = async (req: Request, res: Response) => {
    try {
        const { id, pwd } = req.body

        if (!id || !pwd) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const result = await AccountDB.SignIn({ id })
        if (!result) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
        if (bcrypt.compareSync(pwd, result.pwd)) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
        }
    
        const payload = { _id: result._id }
    
        const accessOptions = {
            issuer: config.JWT_ISSUER,
            expiresIn: Number(process.env.ACCESS_EXPIRE || config.ACCESS_EXPIRE),
        }
    
        const refreshOptions = {
            issuer: config.JWT_ISSUER,
            expiresIn: process.env.REFRESH_EXPIRE || config.REFRESH_EXPIRE, 
        }
    
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET || config.JWT_SECRET, accessOptions)
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET || config.REFRESH_SECRET, refreshOptions)
        
        await AccountDB.UpdateRefreshToken({ id, refreshToken })
    
        const decodedAccessToken: DecodedJwt = decodeJWT(accessToken)
    
        res.send(SuccessResponse({ token: accessToken, exp: decodedAccessToken.exp * 1000 }))
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const RefreshToken = async (req: Request, res: Response) => {
    try {
        const oldAccessToken = (req.header('Authorization') || '').replace('Bearer ', '')
        let decodedOldAccessToken: DecodedJwt
        if (oldAccessToken) {
            decodedOldAccessToken = decodeJWT(oldAccessToken)
            if (decodedOldAccessToken.exp * 1000 > new Date().getTime()) {
                return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
            }
        } else {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
        }
    
        const result = await AccountDB.SignIn({ id: decodedOldAccessToken._id })
        if (!result) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
        
        jwt.verify(result.refreshToken, process.env.REFRESH_SECRET || config.REFRESH_SECRET)
    
        const payload = { _id: result._id }
        
        const accessOptions = {
            issuer: config.JWT_ISSUER,
            expiresIn: Number(process.env.ACCESS_EXPIRE || config.ACCESS_EXPIRE),
        }
    
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET || config.JWT_SECRET, accessOptions)
        const decodedAccessToken: DecodedJwt = decodeJWT(accessToken)
    
        res.send(SuccessResponse({ token: accessToken, exp: decodedAccessToken.exp * 1000 }))
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const VerifyToken = async (req: Request, res: Response) => {
    try {
        const accessToken = (req.header('Authorization') || '').replace('Bearer ', '')
    
        if (await redisClient.checkToken(accessToken)) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST)) // Signout 처리된 Access Token
        }
        
        const decodedAccessToken: DecodedJwt = decodeJWT(accessToken)
        if ((decodedAccessToken.exp * 1000) <= new Date().getTime()) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST)) // 만료된 Access Token입니다
        }
    
        res.send(SuccessResponse(decodedAccessToken))
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const SignOut = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const accessToken = (req.header('Authorization') || '').replace('Bearer ', '')
    
        const decodedAccessToken: DecodedJwt = decodeJWT(accessToken)
        if (!decodedAccessToken || !decodedAccessToken._id || decodedAccessToken.exp) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
        }
    
        await AccountDB.ResetRefreshToken({ _id: me })
        
        // Blacklisting Token
        await redisClient.blacklistToken(accessToken, decodedAccessToken.exp)
        
        res.send(SuccessResponse())
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const ResetPassword = async (req: Request, res: Response) => {
    try {
        const { email, hint } = req.body

        if (!email || !hint) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const result = await AccountDB.GetInterests({ id: email })
        if (!result || !result.interests) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
    
        if (result.interests.includes(hint)) {
            const newPwd = createHash(result.interests.join('') + new Date().toISOString())
            await AccountDB.UpdatePassword({ _id: result._id, pwd: newPwd })
            sendEmail(EmailType.PasswordReset, { email: result.id, name: result.name, password: newPwd })
                .catch((err: Error) => console.log(err))
        }
    
        res.send(SuccessResponse())
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const CheckIsDuplicatedEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }

        const isDuplicated = await AccountDB.doesExist({ id: email })

        res.send(SuccessResponse({ isDuplicated }))
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const CheckIsDuplicatedSnum = async (req: Request, res: Response) => {
    try {
        const { sNum } = req.body

        if (isNaN(sNum)) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
        
        const isDuplicated = await AccountDB.doesExist({ sNum })

        res.send(SuccessResponse({ isDuplicated }))
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const UpdatePassword = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { oldPwd, newPwd } = req.body
        
        const result = await AccountDB.GetPassword({ _id: me })
        if (!result || !result.pwd) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
        
        if (!bcrypt.compareSync(result.pwd, bcrypt.hashSync(oldPwd))) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }

        await AccountDB.UpdatePassword({ _id: me, pwd: newPwd })
        
        const accessToken = (req.header('Authorization') || '').replace('Bearer ', '')
    
        const decodedAccessToken: DecodedJwt = decodeJWT(accessToken!)
        
        // Blacklisting Token
        await redisClient.blacklistToken(accessToken!, decodedAccessToken.exp)
    
        res.send(SuccessResponse())
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const GetInfo = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
    
        const result = await AccountDB.GetItem({ _id: me })
    
        res.send(SuccessResponse(result))
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const UpdateInfo = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { name, sNum, interests, profile } = req.body

        await AccountDB.UpdateInfo({ _id: me, name, sNum, interests, profile })
    
        res.send(SuccessResponse())
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const UpdateNotifications = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { notifications } = req.body

        if (!notifications) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
        
        await AccountDB.UpdateNotifications({ _id: me, notifications })

        res.send(SuccessResponse())
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const Delete = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const accessToken = (req.header('Authorization') || '').replace('Bearer ', '')
    
        const decodedAccessToken: DecodedJwt = decodeJWT(accessToken)
        if (!decodedAccessToken || !decodedAccessToken._id) {
        return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
        }
    
        await AccountDB.Delete({ _id: me })
    
        // Blacklisting Token
        await redisClient.blacklistToken(accessToken, decodedAccessToken.exp)
        
        res.send(SuccessResponse())
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

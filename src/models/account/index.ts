import { connection } from 'mongoose'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import entities from '@common/constants/entities'
import Filter from './interfaces/filter'
import UpdateNotifications from './interfaces/updateNotifications'

const accountColl = connection.collection(entities.ACCOUNT)

export default {
    DeleteBeforeSignUp: (params: { id: string }) => {
        const { id } = params

        return accountColl.deleteMany({ id, isVerified: false, active: false })
    },
    SignUp: (params: {
        id: string,
        pwd: string,
        name: string,
        sNum: number,
        interests: string[],
        profile: string,
        verifyKey: string,
    }) => {
        const { id, name, sNum, interests, profile, verifyKey } = params
        let { pwd } = params

        pwd = bcrypt.hashSync(pwd)

        const currentDate = new Date()

        return accountColl.insertOne({
            id,
            name,
            pwd,
            sNum,
            interests,
            profile,
            notifications: {
                applied: false,
                accepted: false,
                team: false
            },
            verifyKey,
            verifyExpireAt: new Date(currentDate.getTime() + (3600000)), // 1 hour
            active: false,
            createdAt: currentDate,
            updatedAt: currentDate,
        })
    },
    SignIn: (params: { id: string }) => {
        const { id } = params

        return accountColl.findOne({ id, isVerified: true, active: true })
    },
    GetItem: (params: { _id: string }) => {
        const { _id } = params

        return accountColl.findOne(
            { _id: new ObjectId(_id) },
            { projection: { pwd: false } }
        )
    },
    GetInterests: (params: { id: string }) => {
        const { id } = params

        return accountColl.findOne(
            { id, active: true, isVerified: true },
            { projection: { id: true, name: true, interests: true } }
        )
    },
    GetPassword: (params: { _id: string }) => {
        const { _id } = params

        return accountColl.findOne(
            { _id: new ObjectId(_id), active: true, isVerified: true },
            { projection: { id: true, name: true, pwd: true, interests: true } }
        )
    },
    GetCompareEmail: async (params: { id: string }) => {
        const { id } = params

        return (await accountColl.countDocuments({ id, isVerified: true })) > 0
    },
    doesExist: async (param: { _id: string, id: string, sNum: number }): Promise<boolean> => {
        const { _id, id, sNum } = param

        const filter: Partial<Filter> = {}

        if (_id) filter._id = new ObjectId(_id)
        if (id) filter.id = id
        if (sNum) filter.sNum = sNum

        return (await accountColl.countDocuments(filter)) > 0
    },
    
    UpdateRefreshToken: (params: { id: string, refreshToken: string }) => {
        const { id, refreshToken } = params

        return accountColl.updateOne(
            { id, isVerified: true, active: true },
            { $set: { refreshToken } }
        )
    },
    ResetRefreshToken: (params: { _id: string }) => {
        const { _id } = params
        
        return accountColl.updateOne(
            { _id: new ObjectId(_id), isVerified: true, active: true },
            { $unset: { refreshToken: true } }
        )
    },
    UpdateIsVerified: (params: { id: string, verifyKey: string }) => {
        const { id, verifyKey } = params

        return accountColl.updateOne(
            { id, verifyKey, verifyExpireAt: { $gte: new Date() }, isVerified: false, active: false },
            { $set: { isVerified: true, active: true } }
        )
    },
    UpdateVerifyKey: (params: { id: string, verifyKey: string }) => {
        const { id, verifyKey } = params

        return accountColl.updateOne(
            { id, isVerified: false, active: false },
            { $set: { verifyKey } }
        )
    },
    UpdatePassword: (params: { _id: string, pwd: string }) => {
        const { _id } = params
        let { pwd } = params
        pwd = bcrypt.hashSync(pwd)

        return accountColl.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { pwd, updatedAt: new Date() } }
        )
    },
    UpdateInfo: (params: { _id: string, name: string, sNum: number, interests: string[], profile: string }) => {
        const { _id, name, sNum, interests, profile } = params

        return accountColl.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { name, sNum, interests, profile, updatedAt: new Date() } }
        )
    },
    UpdateNotifications: (params: { _id?: string;
        notifications: { applied?: boolean, accepted?: boolean, team?: boolean }; }) => {
        const { _id, notifications: { applied, accepted, team } } = params

        const updateQuery: UpdateNotifications = { notifications: {} }
        if (applied) updateQuery.notifications.applied = applied
        if (accepted) updateQuery.notifications.accepted = accepted
        if (team) updateQuery.notifications.team = team

        return accountColl.updateOne({ _id: new ObjectId(_id) }, { $set: { ...updateQuery, updatedAt: new Date() } })
    },
    Delete: (params: { _id: string }) => {
        const { _id } = params

        return accountColl.updateOne({ _id: new ObjectId(_id), active: true, isVerified: true }, { $set: { active: false } })
    },
}

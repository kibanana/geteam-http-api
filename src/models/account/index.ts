import { connection } from 'mongoose'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { entities } from '@common/constants'
import { Account } from '@models/entities'
import { Filter, UpdateNotifications } from './interfaces'

const accountColl = connection.collection(entities.ACCOUNT)

export default {
    DeleteBeforeSignUp: (params: { id: string }) => {
        const { id } = params

        return accountColl.deleteMany({ id, isVerified: false, active: false })
    },
    SignUp: (params: {
        id: string,
        password: string,
        name: string,
        studentNumber: number,
        interests: string[],
        profile: string,
        verifyKey: string
    }) => {
        const { id, name, studentNumber, interests, profile, verifyKey } = params
        let { password } = params

        password = bcrypt.hashSync(password)

        const currentDate = new Date()

        return accountColl.insertOne({
            id,
            name,
            password,
            studentNumber,
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
            updatedAt: currentDate
        })
    },
    SignIn: (params: { id: string }): Promise<Account | null> => {
        const { id } = params

        return accountColl.findOne({ id, isVerified: true, active: true })
    },
    GetListById: (params: { ids: ObjectId[] }): Promise<Account[]> => {
        const { ids } = params

        return accountColl.find({ _id: ids.map(id => new ObjectId(id)) }).toArray()
    },
    GetItem: (params: { _id: string }): Promise<Partial<Account> | null> => {
        const { _id } = params

        return accountColl.findOne(
            { _id: new ObjectId(_id) },
            { projection: { password: false } }
        )
    },
    GetInterests: (params: { id: string }): Promise<Partial<Account> | null> => {
        const { id } = params

        return accountColl.findOne(
            { id, active: true, isVerified: true },
            { projection: { id: true, name: true, interests: true } }
        )
    },
    GetPassword: (params: { _id: string }): Promise<Partial<Account> | null> => {
        const { _id } = params

        return accountColl.findOne(
            { _id: new ObjectId(_id), active: true, isVerified: true },
            { projection: { id: true, name: true, password: true, interests: true } }
        )
    },
    GetCompareEmail: async (params: { id: string }) => {
        const { id } = params

        return (await accountColl.countDocuments({ id, isVerified: true })) > 0
    },
    DoesExist: async (param: Partial<{ _id: string, id: string, studentNumber: number }>): Promise<boolean> => {
        const { _id, id, studentNumber } = param

        const filter: Partial<Filter> = {}

        if (_id) filter._id = new ObjectId(_id)
        if (id) filter.id = id
        if (studentNumber) filter.studentNumber = studentNumber

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
    UpdatePassword: (params: { _id: string, password: string }) => {
        const { _id } = params
        let { password } = params
        password = bcrypt.hashSync(password)

        return accountColl.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { password, updatedAt: new Date() } }
        )
    },
    UpdateInfo: (params: { _id: string, name: string, studentNumber: number, interests: string[], profile: string }) => {
        const { _id, name, studentNumber, interests, profile } = params

        return accountColl.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { name, studentNumber, interests, profile, updatedAt: new Date() } }
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

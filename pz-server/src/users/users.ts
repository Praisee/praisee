import {
    IRepository, IRepositoryRecord
} from 'pz-server/src/support/repository';

export type TOptionalUser = {id: number}; // TODO: Add null as option for TypeScript 2

export interface IUser extends IRepositoryRecord {
    recordType: 'User'
    id: number
    displayName: string
    email: string
    createdAt: Date
    trusters?: any
}

export interface IUsers extends IRepository {
    findById(userId: number): Promise<IUser>
    getTotalCommunityItems(userId: number): Promise<number>
    getTotalTrusters(userId: number): Promise<number>
    addTrust(trusterId: number, trustedId: number): Promise<boolean>
    removeTrust(trusterId: number, trustedId: number): Promise<boolean>
    isUserTrusting(trusterId: number, trustedId: number): Promise<boolean>
    create(email: string, password: string, displayName: string): Promise<IUser>
}

export interface IUsersBatchable {
    findAllByIds(userIds: Array<number>): Promise<Array<IUser>>
}

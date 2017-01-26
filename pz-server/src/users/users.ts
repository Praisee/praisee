import {
    IRepository, IRepositoryRecord
} from 'pz-server/src/support/repository';

export type TOptionalUser = {id: number, isAdmin: boolean} | null;

export interface IUser extends IRepositoryRecord {
    recordType: 'User' | 'CurrentUser' | 'OtherUser' | 'PraiseeUser'
    id: number
    displayName: string
    email: string
    isAdmin: boolean
    createdAt: Date
    trusters?: any
}

export interface IUsers extends IRepository {
    findById(userId: number): Promise<IUser>
    findByUrlSlugName(urlSlug: string): Promise<IOtherUser | IUser>
    getActivityStats(userId: number): Promise<any>
    getTotalCommunityItems(userId: number): Promise<number>
    getTotalTrusters(userId: number): Promise<number>
    addTrust(trusterId: number, trustedId: number): Promise<boolean>
    removeTrust(trusterId: number, trustedId: number): Promise<boolean>
    isUserTrusting(trusterId: number, trustedId: number): Promise<boolean>
    getReputation(userId: number): Promise<number>
    create(email: string, password: string, displayName: string): Promise<IUser>
}

export interface IUsersBatchable {
    findAllByIds(userIds: Array<number>): Promise<Array<IUser>>
}

export interface IOtherUser extends IRepositoryRecord {
    recordType: 'OtherUser'
    id: number
    displayName: string
    email: string
}

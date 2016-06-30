export interface IUser extends IPersistedModel {
    login(credentials: {}, callback: ICallback)
}

export interface IUserInstance extends IPersistedModelInstance {
    emailVerified: boolean
    
    hasPassword(password, callback: ICallback)
}

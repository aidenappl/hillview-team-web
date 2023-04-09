import { User } from "../models/user.model"


const GetAccountLander = (user: User): string => {
    if (!user) return '/'
    if (user.authentication.short_name === 'admin' ) {
        return '/team/dashboard'
    } 
    if (user.authentication.short_name === 'student') {
        return '/student/dashboard'
    }
    if (user.authentication.short_name === 'unauthorized') {
        return '/account/pending'
    } 
    if (user.authentication.short_name === 'deleted') {
        return '/account/terminated'
    }
    return '/'
}

export { GetAccountLander }
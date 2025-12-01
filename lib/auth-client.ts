import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'


export const { signIn, signUp, signOut, useSession ,verifyEmail,getSession,organization} =  createAuthClient({
    plugins: [ 
        organizationClient() 
    ] 
})
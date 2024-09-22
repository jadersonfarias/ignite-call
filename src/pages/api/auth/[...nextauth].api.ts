// [...nextauth] quer dizer que pode receber vários parametros,
import { PrismaAdapter } from '@/lib/auth/prisma-adpapter'

import { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'

export function buildNextAuthOptions(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res'],
): NextAuthOptions {
  return {
    adapter: PrismaAdapter(req, res),

    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
            scope:
              'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
          },
        },

        profile(profile: GoogleProfile) {
          // pega os dados do google do usuario
          return {
            id: profile.sub,
            name: profile.name,
            username: '',
            avatar_url: profile.picture,
            email: profile.email,
          }
        },
      }),
    ],
    callbacks: {
      async signIn({ account }) {
        // assim que o user logou
        if (
          !account?.scope?.includes('https://www.googleapis.com/auth/calendar')
        ) {
          return '/register/connect-calendar?error=permissions'
        }
        return true
      },

      async session({ session, user }) {
        // pega todas as informações do úsuario
        return {
          ...session,
          user,
        }
      },
    },
  }

  // export default NextAuth(authOptions)
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, buildNextAuthOptions(req, res))
}

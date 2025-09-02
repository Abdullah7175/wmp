// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ACTION_TYPES, EFILING_ENTITY_TYPES } from '@/lib/efilingActionLogger';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Starting authentication for:', credentials.email);
          
          const client = await connectToDatabase();
          console.log('Database connected successfully');
          
          // Check users table first
          console.log('Checking users table...');
          let userResult = await client.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
          
          if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            console.log('User found in users table, mapped userType: user');
            
            const isValid = await bcrypt.compare(credentials.password, user.password);
            console.log('Verifying password...');
            
            if (isValid) {
              console.log('Password verified successfully');
              console.log('User authenticated:', { id: user.id, name: user.name, userType: 'user', role: user.role });
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                userType: 'user'
              };
            }
          }
          
          // Check agents table
          let agentResult = await client.query('SELECT * FROM agents WHERE email = $1', [credentials.email]);
          
          if (agentResult.rows.length > 0) {
            const agent = agentResult.rows[0];
            console.log('User found in agents table, mapped userType: agent');
            
            const isValid = await bcrypt.compare(credentials.password, agent.password);
            console.log('Verifying password...');
            
            if (isValid) {
              console.log('Password verified successfully');
              console.log('User authenticated:', { id: agent.id, name: agent.name, userType: 'agent', role: agent.role });
              return {
                id: agent.id,
                name: agent.name,
                email: agent.email,
                role: agent.role,
                userType: 'agent'
              };
            }
          }
          
          // Check socialmediaperson table
          let smResult = await client.query('SELECT * FROM socialmediaperson WHERE email = $1', [credentials.email]);
          
          if (smResult.rows.length > 0) {
            const sm = smResult.rows[0];
            console.log('User found in socialmediaperson table, mapped userType: socialmedia');
            
            const isValid = await bcrypt.compare(credentials.password, sm.password);
            console.log('Verifying password...');
            
            if (isValid) {
              console.log('Password verified successfully');
              console.log('User authenticated:', { id: sm.id, name: sm.name, userType: 'socialmedia', role: sm.role });
              return {
                id: sm.id,
                name: sm.name,
                email: sm.email,
                role: sm.role,
                userType: 'socialmedia'
              };
            }
          }
          
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/",
    error: "/"
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here-make-it-long-and-random",
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 // 1 hour
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Log successful login
      try {
        if (user && user.id) {
                      await eFileActionLogger.logAction({
                entityId: null,
                userId: user.id.toString(),
                action: 'USER_LOGIN',
                entityType: 'auth',
                details: { 
                    method: account?.provider || 'credentials', 
                    userType: user.userType || 'user',
                    description: `User "${user.name}" logged into e-filing system`
                }
            });
        }
      } catch (logError) {
        console.error('Error logging login action:', logError);
        // Don't fail the login if logging fails
      }
      
      if (account?.provider === 'google') {
        try {
          const client = await connectToDatabase();
          
          // Check if user exists in any of our tables
          let userResult = await client.query('SELECT * FROM users WHERE email = $1', [user.email]);
          let agentResult = await client.query('SELECT * FROM agents WHERE email = $1', [user.email]);
          let smResult = await client.query('SELECT * FROM socialmediaperson WHERE email = $1', [user.email]);
          
          if (userResult.rows.length > 0) {
            const dbUser = userResult.rows[0];
            user.id = dbUser.id;
            user.role = dbUser.role;
            user.userType = 'user';
          } else if (agentResult.rows.length > 0) {
            const dbUser = agentResult.rows[0];
            user.id = dbUser.id;
            user.role = dbUser.role;
            user.userType = 'agent';
          } else if (smResult.rows.length > 0) {
            const dbUser = smResult.rows[0];
            user.id = dbUser.id;
            user.role = dbUser.role;
            user.userType = 'socialmedia';
          } else {
            // Create new user in users table if not found
            const newUserResult = await client.query(
              'INSERT INTO users (name, email, role, userType) VALUES ($1, $2, $3, $4) RETURNING *',
              [user.name, user.email, 'user', 'user']
            );
            user.id = newUserResult.rows[0].id;
            user.role = 'user';
            user.userType = 'user';
          }
          
          await client.release();
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async signOut({ token }) {
      // Log successful logout
      try {
        if (token?.user?.id) {
          await eFileActionLogger.logAction({
            entityId: null,
            userId: token.user.id.toString(),
            action: 'USER_LOGOUT',
            entityType: 'auth',
            details: { 
              method: 'session_end', 
              userType: token.user.userType || 'user',
              description: `User "${token.user.name}" logged out from e-filing system`
            }
          });
        }
      } catch (logError) {
        console.error('Error logging logout action:', logError);
        // Don't fail the logout if logging fails
      }
    }
  }
};

export default NextAuth(authOptions);




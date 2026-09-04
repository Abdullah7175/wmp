// auth.js - NextAuth v5 (Auth.js) configuration
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger } from '@/lib/efilingActionLogger';

import { isDualPortalUser } from '@/lib/dualPortalAuth';

// Ensure Auth.js trusts incoming Host headers for local IPs, LAN & multi-host setups
if (!process.env.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = 'true';
}

// Allow HTTP login on local IPs / LAN:
// Browsers strictly reject cookies with the "Secure" attribute or "__Secure-" / "__Host-" prefix when accessed over plain HTTP.
// When ALLOW_HTTP_LOGIN is enabled (default: true unless FORCE_SECURE_COOKIES=true), use standard non-prefixed cookies with secure: false.
// This allows authentication to work seamlessly over both HTTPS (production) and plain HTTP (local IPs / LAN / dev).
const isProduction = process.env.NODE_ENV === 'production';
const forceSecureCookies = process.env.FORCE_SECURE_COOKIES === 'true';
const allowHttpLogin = process.env.ALLOW_HTTP_LOGIN !== 'false';
const useSecure = forceSecureCookies || (!allowHttpLogin && isProduction && process.env.NEXTAUTH_URL?.startsWith('https://'));

const cookiePrefix = useSecure ? '__Secure-' : '';
const csrfPrefix = useSecure && !process.env.BEHIND_PROXY ? '__Host-' : useSecure ? '__Secure-' : '';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // Allow localhost and local IP hosts dynamically
  basePath: "/api/auth", // Explicitly set the base path
  useSecureCookies: useSecure,
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
        let client;
        try {
          console.log('Starting authentication for:', credentials.email);
          
          if (!credentials.email || !credentials.password) {
            console.log('Missing email or password');
            return null;
          }
          
          client = await connectToDatabase();
          console.log('Database connected successfully');
          
          // Check users table first
          console.log('Checking users table...');
          let userResult = await client.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
          
          if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            console.log('User found in users table, mapped userType: user');
            
            // Diagnostic logging for password verification
            const storedPassword = user.password ? user.password.trim() : null;
            
            // Check if password field exists and is not null
            if (!storedPassword) {
              console.log('User has no password set');
              await client.release();
              return null;
            }
            const passwordLength = storedPassword ? storedPassword.length : 0;
            const isBcryptHash = storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$'));
            console.log('Password diagnostic:', {
              hasPassword: !!storedPassword,
              passwordLength,
              isBcryptHash,
              hashPrefix: storedPassword ? storedPassword.substring(0, 7) : 'none',
              inputPasswordLength: credentials.password ? credentials.password.length : 0
            });
            
            console.log('Verifying password...');
            let isValid = false;
            try {
              isValid = await bcrypt.compare(credentials.password, storedPassword);
              console.log('Password verification result:', isValid);
              
              // If verification fails, try with trimmed input password (in case of whitespace)
              if (!isValid && credentials.password.trim() !== credentials.password) {
                console.log('Retrying with trimmed input password...');
                isValid = await bcrypt.compare(credentials.password.trim(), storedPassword);
                console.log('Password verification result (trimmed):', isValid);
              }
            } catch (compareError) {
              console.error('Error during password comparison:', compareError.message);
              console.error('Hash format check:', {
                startsWith2a: storedPassword.startsWith('$2a$'),
                startsWith2b: storedPassword.startsWith('$2b$'),
                startsWith2y: storedPassword.startsWith('$2y$'),
                hashLength: storedPassword.length
              });
            }
            
            if (isValid) {
              console.log('Password verified successfully');
              console.log('User authenticated:', { id: user.id, name: user.name, userType: 'user', role: user.role });
              await client.release();
              return {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                userType: 'user'
              };
            } else {
              console.log('Password verification failed for user');
            }
          }
          
          // Check agents table
          let agentResult = await client.query('SELECT * FROM agents WHERE email = $1', [credentials.email]);
          
          if (agentResult.rows.length > 0) {
            const agent = agentResult.rows[0];
            console.log('User found in agents table, mapped userType: agent');
            
            // Diagnostic logging for password verification
            const storedPassword = agent.password ? agent.password.trim() : null;
            
            if (!storedPassword) {
              console.log('Agent has no password set');
              await client.release();
              return null;
            }
            const passwordLength = storedPassword ? storedPassword.length : 0;
            const isBcryptHash = storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$'));
            console.log('Password diagnostic (agent):', {
              hasPassword: !!storedPassword,
              passwordLength,
              isBcryptHash,
              hashPrefix: storedPassword ? storedPassword.substring(0, 7) : 'none',
              inputPasswordLength: credentials.password ? credentials.password.length : 0
            });
            
            console.log('Verifying password...');
            const isValid = await bcrypt.compare(credentials.password, storedPassword);
            console.log('Password verification result:', isValid);
            
            if (isValid) {
              console.log('Password verified successfully');
              console.log('User authenticated:', { id: agent.id, name: agent.name, userType: 'agent', role: agent.role });
              await client.release();
              return {
                id: agent.id.toString(),
                name: agent.name,
                email: agent.email,
                role: agent.role,
                userType: 'agent'
              };
            } else {
              console.log('Password verification failed for agent');
            }
          }
          
          // Check socialmediaperson table
          let smResult = await client.query('SELECT * FROM socialmediaperson WHERE email = $1', [credentials.email]);
          
          if (smResult.rows.length > 0) {
            const sm = smResult.rows[0];
            console.log('User found in socialmediaperson table, mapped userType: socialmedia');
            
            // Diagnostic logging for password verification
            const storedPassword = sm.password ? sm.password.trim() : null;
            
            if (!storedPassword) {
              console.log('Social media person has no password set');
              await client.release();
              return null;
            }
            const passwordLength = storedPassword ? storedPassword.length : 0;
            const isBcryptHash = storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$'));
            console.log('Password diagnostic (socialmedia):', {
              hasPassword: !!storedPassword,
              passwordLength,
              isBcryptHash,
              hashPrefix: storedPassword ? storedPassword.substring(0, 7) : 'none',
              inputPasswordLength: credentials.password ? credentials.password.length : 0
            });
            
            console.log('Verifying password...');
            const isValid = await bcrypt.compare(credentials.password, storedPassword);
            console.log('Password verification result:', isValid);
            
            if (isValid) {
              console.log('Password verified successfully');
              console.log('User authenticated:', { id: sm.id, name: sm.name, userType: 'socialmedia', role: sm.role });
              await client.release();
              return {
                id: sm.id.toString(),
                name: sm.name,
                email: sm.email,
                role: sm.role,
                userType: 'socialmedia'
              };
            } else {
              console.log('Password verification failed for social media person');
            }
          }
          
          console.log('No matching user found or password incorrect');
          await client.release();
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          if (client) {
            await client.release();
          }
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/",
    error: "/"
  },
  // SECURITY: No default secret - must be set in environment variables
  secret: (() => {
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error('NEXTAUTH_SECRET must be set in environment variables');
    }
    return process.env.NEXTAUTH_SECRET;
  })(),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 // 1 hour
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecure,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecure,
      },
    },
    csrfToken: {
      name: `${csrfPrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecure,
        ...(useSecure && process.env.BEHIND_PROXY && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.user = {
          ...user,
          isDualPortal: isDualPortalUser(user.email)
        };
      } else if (token.user) {
        // Keep isDualPortal updated in case .env changes dynamically
        token.user.isDualPortal = isDualPortalUser(token.user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = {
          ...token.user,
          isDualPortal: isDualPortalUser(token.user.email)
        };
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
        let client;
        try {
          client = await connectToDatabase();
          
          // Check if user exists in any of our tables
          let userResult = await client.query('SELECT * FROM users WHERE email = $1', [user.email]);
          let agentResult = await client.query('SELECT * FROM agents WHERE email = $1', [user.email]);
          let smResult = await client.query('SELECT * FROM socialmediaperson WHERE email = $1', [user.email]);
          
          if (userResult.rows.length > 0) {
            const dbUser = userResult.rows[0];
            user.id = dbUser.id.toString();
            user.role = dbUser.role;
            user.userType = 'user';
          } else if (agentResult.rows.length > 0) {
            const dbUser = agentResult.rows[0];
            user.id = dbUser.id.toString();
            user.role = dbUser.role;
            user.userType = 'agent';
          } else if (smResult.rows.length > 0) {
            const dbUser = smResult.rows[0];
            user.id = dbUser.id.toString();
            user.role = dbUser.role;
            user.userType = 'socialmedia';
          } else {
            // SECURITY: Reject unauthorized Google sign-ins; do NOT auto-create users
            console.warn(`[Google Sign-In Rejected] Email ${user.email} not found in pre-provisioned user tables.`);
            return false;
          }
          
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        } finally {
          if (client && typeof client.release === 'function') {
            try {
              await client.release();
            } catch (releaseError) {
              console.error('Error releasing database client in Google sign-in:', releaseError);
            }
          }
        }
      }
      return true;
    }
  },
  events: {
    async signOut({ session, token }) {
      // Log successful logout
      try {
        const user = session?.user || token?.user;
        if (user?.id) {
          await eFileActionLogger.logAction({
            entityId: null,
            userId: user.id.toString(),
            action: 'USER_LOGOUT',
            entityType: 'auth',
            details: { 
              method: 'session_end', 
              userType: user.userType || 'user',
              description: `User "${user.name}" logged out from e-filing system`
            }
          });
        }
      } catch (logError) {
        console.error('Error logging logout action:', logError);
        // Don't fail the logout if logging fails
      }
    }
  }
});


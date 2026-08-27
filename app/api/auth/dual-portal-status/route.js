import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isDualPortalUser, getDualPortalUsers } from '@/lib/dualPortalAuth';
import { isInternalNetwork } from '@/middleware/validateNetwork';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await auth();
        const userEmail = session?.user?.email || null;
        const isDual = userEmail ? isDualPortalUser(userEmail) : false;
        const isInternal = isInternalNetwork(request);

        return NextResponse.json({
            authenticated: Boolean(session?.user),
            user: session?.user ? {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                role: session.user.role,
                userType: session.user.userType,
                isDualPortal: isDual
            } : null,
            isDualPortalUser: isDual,
            isInternalNetwork: isInternal,
            canAccessWMP: Boolean(session?.user),
            canAccessEfiling: isDual || isInternal,
            dualPortalUsersCount: getDualPortalUsers().length
        });
    } catch (error) {
        console.error('Error checking dual portal status:', error);
        return NextResponse.json({
            error: 'Failed to verify dual portal status',
            isDualPortalUser: false,
            isInternalNetwork: false
        }, { status: 500 });
    }
}

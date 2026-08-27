import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isDualPortalUser, getDualPortalUsers } from '@/lib/dualPortalAuth';
import { isInternalNetwork } from '@/middleware/validateNetwork';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await auth();
        const user = session?.user || null;
        const isDual = user ? isDualPortalUser(user) : false;
        const isInternal = isInternalNetwork(request);

        return NextResponse.json({
            authenticated: Boolean(user),
            user: user ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                userType: user.userType,
                isDualPortal: isDual
            } : null,
            isDualPortalUser: isDual,
            isInternalNetwork: isInternal,
            canAccessWMP: Boolean(user),
            canAccessEfiling: Boolean(isInternal || isDual),
            showBothPortals: Boolean(isDual || (isInternal && user?.role === 1)),
            dualPortalUsersCount: getDualPortalUsers().length
        });
    } catch (error) {
        console.error('Error checking dual portal status:', error);
        return NextResponse.json({
            error: 'Failed to verify dual portal status',
            isDualPortalUser: false,
            isInternalNetwork: false,
            canAccessWMP: false,
            canAccessEfiling: false,
            showBothPortals: false
        }, { status: 500 });
    }
}


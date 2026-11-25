import WatchPlayer from './WatchPlayer';
import { readWatchToken } from '@/lib/watchLink';

export const dynamic = 'force-dynamic';
export const metadata = {
    title: 'Video',
    robots: { index: false, follow: false, nocache: true },
};

const blank = {
    position: 'fixed',
    inset: 0,
    margin: 0,
    background: '#000',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 24,
};

export default async function WatchPage({ params }) {
    const resolved = await params;
    const token = typeof resolved?.token === 'string' ? resolved.token : '';
    if (!readWatchToken(token)) {
        return (
            <main style={blank}>
                <p>This link is not valid.</p>
            </main>
        );
    }
    return <WatchPlayer token={token} />;
}

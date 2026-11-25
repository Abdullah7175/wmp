"use client";

import { useEffect, useRef, useState } from 'react';

const pageStyle = {
    position: 'fixed',
    inset: 0,
    margin: 0,
    background: '#000',
    color: '#fff',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
};

export default function WatchPlayer({ token }) {
    const videoRef = useRef(null);
    const killed = useRef(false);
    const [phase, setPhase] = useState('loading');

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !token) return undefined;

        const shut = () => {
            if (killed.current) return;
            killed.current = true;
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch { /* ignore */ }
            setPhase('closed');
            try {
                const closer = window.open('', '_self');
                closer?.close();
                window.close();
            } catch { /* ignore */ }
            window.location.replace('about:blank');
        };

        const onKey = (event) => {
            const key = String(event.key || '').toLowerCase();
            const blocked =
                key === 'f12' ||
                ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) ||
                ((event.ctrlKey || event.metaKey) && ['u', 's', 'p'].includes(key)) ||
                (event.metaKey && event.altKey && ['i', 'j', 'c', 'u'].includes(key));
            if (!blocked) return;
            event.preventDefault();
            event.stopPropagation();
            shut();
        };

        const onContext = (event) => {
            event.preventDefault();
            shut();
        };

        const onCopy = (event) => {
            event.preventDefault();
            shut();
        };

        const desktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches
            && window.innerWidth >= 1024;
        const baseGapW = Math.abs(window.outerWidth - window.innerWidth);
        const baseGapH = Math.abs(window.outerHeight - window.innerHeight);

        const onResize = () => {
            if (!desktop || killed.current) return;
            const gapW = Math.abs(window.outerWidth - window.innerWidth);
            const gapH = Math.abs(window.outerHeight - window.innerHeight);
            if (gapW - baseGapW > 160 || gapH - baseGapH > 160) shut();
        };

        document.addEventListener('contextmenu', onContext, true);
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('copy', onCopy, true);
        document.addEventListener('cut', onCopy, true);
        const onDrag = (event) => event.preventDefault();
        document.addEventListener('dragstart', onDrag, true);
        window.addEventListener('resize', onResize);

        let probe = 0;
        if (desktop) {
            probe = window.setInterval(() => {
                if (killed.current) return;
                const started = performance.now();
                // eslint-disable-next-line no-debugger
                debugger;
                if (performance.now() - started > 120) shut();
            }, 1500);
        }

        video.setAttribute('controlsList', 'nodownload noplaybackrate noremoteplayback');
        video.disablePictureInPicture = true;
        video.disableRemotePlayback = true;
        video.setAttribute('controls', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');

        const onPip = () => shut();
        video.addEventListener('enterpictureinpicture', onPip);

        let cancelled = false;
        const open = async () => {
            try {
                const response = await fetch('/api/watch/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    cache: 'no-store',
                    body: JSON.stringify({ token }),
                });
                if (cancelled || killed.current) return;
                const data = await response.json().catch(() => ({}));
                if (!response.ok || !data.e || !data.s) {
                    setPhase(data.error === 'missing' ? 'missing' : 'invalid');
                    return;
                }
                const playback = new URLSearchParams({ e: String(data.e), s: String(data.s) });
                video.src = `/api/watch/stream/${encodeURIComponent(token)}?${playback.toString()}`;
                video.load();
                try {
                    await video.play();
                    if (!cancelled) setPhase('playing');
                } catch {
                    if (!cancelled) setPhase('tap');
                }
            } catch {
                if (!cancelled) setPhase('invalid');
            }
        };

        open();

        return () => {
            cancelled = true;
            document.removeEventListener('contextmenu', onContext, true);
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('copy', onCopy, true);
            document.removeEventListener('cut', onCopy, true);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('dragstart', onDrag, true);
            video.removeEventListener('enterpictureinpicture', onPip);
            if (probe) window.clearInterval(probe);
        };
    }, [token]);

    const play = () => {
        const video = videoRef.current;
        if (!video) return;
        video.play().then(() => setPhase('playing')).catch(() => setPhase('tap'));
    };

    const message = phase === 'missing'
        ? 'The final video is not available.'
        : phase === 'failed'
            ? 'This video cannot be played.'
            : phase === 'invalid'
                ? 'This link is not valid.'
                : phase === 'loading'
                    ? 'Loading video…'
                    : '';

    return (
        <main style={pageStyle}>
            <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                preload="auto"
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                disableRemotePlayback
                style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '100dvh',
                    background: '#000',
                    objectFit: 'contain',
                    display: phase === 'missing' || phase === 'invalid' || phase === 'failed' ? 'none' : 'block',
                }}
                onError={() => {
                    if (videoRef.current?.currentSrc) setPhase('failed');
                }}
            />
            {phase === 'tap' && (
                <button
                    type="button"
                    onClick={play}
                    style={{
                        position: 'absolute',
                        padding: '14px 28px',
                        border: 0,
                        borderRadius: 8,
                        background: '#fff',
                        color: '#000',
                        fontSize: 18,
                    }}
                >
                    Play
                </button>
            )}
            {message && phase !== 'tap' && phase !== 'playing' && (
                <p style={{ position: 'absolute', fontSize: 16, textAlign: 'center', padding: 24 }}>{message}</p>
            )}
        </main>
    );
}

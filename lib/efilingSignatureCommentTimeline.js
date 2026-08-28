/**
 * Merges signatures and comments into a single chronological timeline.
 * Pairs each signature with a same-user comment within a 30-minute window.
 */
export function buildSignatureCommentTimeline(signatures = [], comments = []) {
    const usedCommentIds = new Set();
    const entries = [];

    const sortedSignatures = [...signatures].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const signature of sortedSignatures) {
        const sigTime = new Date(signature.timestamp).getTime();
        const userId = signature.user_id != null ? String(signature.user_id) : null;

        let matchedComment = null;
        let bestDelta = Infinity;
        const maxWindow = 30 * 60 * 1000;

        for (const comment of comments) {
            if (usedCommentIds.has(comment.id)) continue;
            if (userId && comment.user_id != null && String(comment.user_id) !== userId) continue;

            const commentTime = new Date(comment.timestamp).getTime();
            const delta = Math.abs(commentTime - sigTime);
            if (delta <= maxWindow && delta < bestDelta) {
                bestDelta = delta;
                matchedComment = comment;
            }
        }

        if (matchedComment) {
            usedCommentIds.add(matchedComment.id);
        }

        const sortTime = matchedComment
            ? Math.min(sigTime, new Date(matchedComment.timestamp).getTime())
            : sigTime;

        entries.push({
            key: `sig-${signature.id}`,
            signature,
            comment: matchedComment,
            sortTime,
        });
    }

    for (const comment of comments) {
        if (usedCommentIds.has(comment.id)) continue;
        entries.push({
            key: `comment-${comment.id}`,
            signature: null,
            comment,
            sortTime: new Date(comment.timestamp).getTime(),
        });
    }

    entries.sort((a, b) => a.sortTime - b.sortTime);
    return entries;
}

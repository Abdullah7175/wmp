/**
 * Normalize clipboard HTML (Word / Google Docs / browsers)
 * so TipTap keeps headings, bold, italic, underline on paste.
 */
export function normalizePastedHtml(html) {
    if (!html || typeof html !== "string") return html;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        doc
            .querySelectorAll("meta, style, script, link, xml, title")
            .forEach((el) => el.remove());

        // Word leftover empty tags
        doc.querySelectorAll("o\\:p").forEach((el) => {
            el.replaceWith(...Array.from(el.childNodes));
        });

        const promoteHeading = (el, level) => {
            const h = doc.createElement(`h${level}`);
            h.innerHTML = el.innerHTML;
            el.replaceWith(h);
            return h;
        };

        const wrapInline = (el, tagName) => {
            if (!el.childNodes.length) return;
            const wrapper = doc.createElement(tagName);
            while (el.firstChild) wrapper.appendChild(el.firstChild);
            el.appendChild(wrapper);
        };

        const walk = (node) => {
            if (node.nodeType !== 1) return;
            const el = node;
            const tag = el.tagName.toLowerCase();
            const style = (el.getAttribute("style") || "").toLowerCase();
            const cls = el.getAttribute("class") || "";

            // Word / Docs heading paragraphs → real headings
            if (tag === "p") {
                if (/msoheading\s*1|heading\s*1|title/i.test(cls) || /mso-outline-level:\s*1/i.test(style)) {
                    const h = promoteHeading(el, 1);
                    Array.from(h.childNodes).forEach(walk);
                    return;
                }
                if (/msoheading\s*2|heading\s*2/i.test(cls) || /mso-outline-level:\s*2/i.test(style)) {
                    const h = promoteHeading(el, 2);
                    Array.from(h.childNodes).forEach(walk);
                    return;
                }
                if (/msoheading\s*3|heading\s*3/i.test(cls) || /mso-outline-level:\s*3/i.test(style)) {
                    const h = promoteHeading(el, 3);
                    Array.from(h.childNodes).forEach(walk);
                    return;
                }
            }

            const alreadyStrong = ["b", "strong", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag);
            const alreadyEm = ["i", "em"].includes(tag);
            const alreadyU = tag === "u";

            if (!alreadyStrong && /font-weight:\s*(bold|[6-9]00)/i.test(style)) {
                wrapInline(el, "strong");
            }
            if (!alreadyEm && /font-style:\s*italic/i.test(style)) {
                wrapInline(el, "em");
            }
            if (!alreadyU && /text-decoration:\s*[^;]*underline/i.test(style)) {
                wrapInline(el, "u");
            }

            // Prefer semantic tags Word sometimes uses
            if (tag === "b") {
                const strong = doc.createElement("strong");
                strong.innerHTML = el.innerHTML;
                el.replaceWith(strong);
                Array.from(strong.childNodes).forEach(walk);
                return;
            }
            if (tag === "i") {
                const em = doc.createElement("em");
                em.innerHTML = el.innerHTML;
                el.replaceWith(em);
                Array.from(em.childNodes).forEach(walk);
                return;
            }

            Array.from(el.childNodes).forEach(walk);
        };

        Array.from(doc.body.childNodes).forEach(walk);
        return doc.body.innerHTML;
    } catch {
        return html;
    }
}

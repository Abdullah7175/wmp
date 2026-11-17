"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALLOWED_TAGS = new Set([
  "B", "STRONG", "I", "EM", "U", "MARK", "SPAN", "BR", "DIV", "P", "FONT",
]);

const HIGHLIGHT_BG = "#fef08a";

function isHighlightBackground(value) {
  if (!value) return false;
  const v = String(value).toLowerCase().replace(/\s+/g, "");
  if (!v || v === "transparent" || v === "rgba(0,0,0,0)" || v === "initial" || v === "inherit") {
    return false;
  }
  return true;
}

/** Keep only formatting tags used by the comment toolbar. */
export function sanitizeCommentHtml(html) {
  if (!html || typeof html !== "string") return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/on\w+\s*=\s*(['"]).*?\1/gi, "")
      .replace(/javascript:/gi, "");
  }

  const doc = new DOMParser().parseFromString(html, "text/html");

  const clean = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toUpperCase();
        if (!ALLOWED_TAGS.has(tag)) {
          while (child.firstChild) {
            node.insertBefore(child.firstChild, child);
          }
          node.removeChild(child);
          continue;
        }

        const bgBefore =
          child.style?.backgroundColor ||
          child.style?.background ||
          "";
        const hadHighlight =
          tag === "MARK" || isHighlightBackground(bgBefore);

        // Strip unsafe attributes first
        const attrs = Array.from(child.attributes || []);
        for (const attr of attrs) {
          child.removeAttribute(attr.name);
        }

        // Restore highlight on MARK / highlighted SPAN/FONT (inline styles help print/PDF)
        if (hadHighlight) {
          const bg = isHighlightBackground(bgBefore) ? bgBefore : HIGHLIGHT_BG;
          child.style.backgroundColor = bg;
          child.style.setProperty("-webkit-print-color-adjust", "exact");
          child.style.setProperty("print-color-adjust", "exact");
          child.style.setProperty("box-shadow", `inset 0 0 0 1000px ${bg}`);
        }

        // Normalize highlighted SPAN/FONT to MARK for consistent display
        if ((tag === "SPAN" || tag === "FONT") && hadHighlight) {
          const mark = doc.createElement("mark");
          const bg = child.style.backgroundColor || HIGHLIGHT_BG;
          mark.style.backgroundColor = bg;
          mark.style.setProperty("-webkit-print-color-adjust", "exact");
          mark.style.setProperty("print-color-adjust", "exact");
          mark.style.setProperty("box-shadow", `inset 0 0 0 1000px ${bg}`);
          while (child.firstChild) {
            mark.appendChild(child.firstChild);
          }
          node.replaceChild(mark, child);
          clean(mark);
          continue;
        }

        clean(child);
      } else if (child.nodeType === Node.COMMENT_NODE) {
        node.removeChild(child);
      }
    }
  };

  clean(doc.body);
  return doc.body.innerHTML;
}

export function commentHtmlToPlainText(html) {
  if (!html) return "";
  if (typeof window === "undefined") {
    return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
}

export function CommentHtmlDisplay({ html, className = "" }) {
  const safe = sanitizeCommentHtml(html || "");
  return (
    <div
      className={`comment-rich-html whitespace-pre-wrap break-words [&_mark]:bg-[#fef08a] [&_mark]:px-0.5 [&_mark]:rounded-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

function wrapSelectionWithMark(editor) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return false;

  const mark = document.createElement("mark");
  mark.style.backgroundColor = HIGHLIGHT_BG;

  try {
    range.surroundContents(mark);
  } catch {
    // Selection crosses element boundaries — extract + wrap
    const frag = range.extractContents();
    mark.appendChild(frag);
    range.insertNode(mark);
  }

  // Keep caret after the mark
  sel.removeAllRanges();
  const after = document.createRange();
  after.setStartAfter(mark);
  after.collapse(true);
  sel.addRange(after);
  return true;
}

/**
 * Lightweight rich-text editor for efiling comments.
 * Supports bold / italic / underline / highlight only.
 */
export default function CommentRichTextEditor({
  value = "",
  onChange,
  placeholder = "Enter your comment...",
  minHeight = 160,
  className = "",
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const next = value || "";
    if (el.innerHTML !== next) {
      el.innerHTML = next;
    }
  }, [value]);

  const emitChange = () => {
    const el = editorRef.current;
    if (!el || !onChange) return;
    onChange(sanitizeCommentHtml(el.innerHTML));
  };

  const runCommand = (command, commandValue = null) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    try {
      if (command === "highlight") {
        // Manual <mark> wrap — execCommand hiliteColor is unreliable across browsers
        const wrapped = wrapSelectionWithMark(el);
        if (!wrapped) {
          // Fallback if no selection / surround failed
          document.execCommand("hiliteColor", false, HIGHLIGHT_BG);
          document.execCommand("backColor", false, HIGHLIGHT_BG);
        }
      } else {
        document.execCommand(command, false, commandValue);
      }
    } catch {
      // ignore unsupported command
    }
    emitChange();
  };

  return (
    <div className={`border rounded-md overflow-hidden bg-white ${className}`}>
      <div className="flex items-center gap-1 border-b bg-gray-50 px-2 py-1.5">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 font-bold"
          title="Bold"
          onMouseDown={(e) => {
            e.preventDefault();
            runCommand("bold");
          }}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          title="Italic"
          onMouseDown={(e) => {
            e.preventDefault();
            runCommand("italic");
          }}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          title="Underline"
          onMouseDown={(e) => {
            e.preventDefault();
            runCommand("underline");
          }}
        >
          <Underline className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-yellow-700"
          title="Highlight"
          onMouseDown={(e) => {
            e.preventDefault();
            runCommand("highlight");
          }}
        >
          <Highlighter className="w-4 h-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        className="w-full p-2 text-sm outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 [&_mark]:bg-[#fef08a] [&_mark]:px-0.5 [&_mark]:rounded-sm"
        style={{ minHeight }}
        onInput={emitChange}
        onBlur={emitChange}
      />
    </div>
  );
}

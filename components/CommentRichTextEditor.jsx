"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALLOWED_TAGS = new Set([
  "B", "STRONG", "I", "EM", "U", "MARK", "SPAN", "BR", "DIV", "P", "FONT",
]);

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

        // Strip all attributes except safe highlight styles on SPAN/MARK/FONT
        const attrs = Array.from(child.attributes || []);
        for (const attr of attrs) {
          const name = attr.name.toLowerCase();
          if (name === "style" && (tag === "SPAN" || tag === "MARK" || tag === "FONT")) {
            const bg =
              child.style.backgroundColor ||
              child.style.background ||
              "";
            child.removeAttribute("style");
            if (bg) {
              child.style.backgroundColor = bg;
            }
          } else if (name === "color" && tag === "FONT") {
            // ignore text color
            child.removeAttribute(attr.name);
          } else {
            child.removeAttribute(attr.name);
          }
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
      className={`comment-rich-html whitespace-pre-wrap break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
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
        // Prefer hiliteColor; fall back to backColor
        const ok = document.execCommand("hiliteColor", false, "#fef08a");
        if (!ok) {
          document.execCommand("backColor", false, "#fef08a");
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
        className="w-full p-2 text-sm outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        style={{ minHeight }}
        onInput={emitChange}
        onBlur={emitChange}
      />
    </div>
  );
}

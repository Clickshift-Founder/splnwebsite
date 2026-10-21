import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders untrusted markdown safely: raw HTML is NOT enabled (no rehype-raw), links open externally. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-spln">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const ext = href?.startsWith("http");
            return (
              <a href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
                {children}
              </a>
            );
          },
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => (typeof src === "string" ? <img src={src} alt={alt ?? ""} loading="lazy" /> : null),
          h1: ({ children }) => <h2>{children}</h2>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

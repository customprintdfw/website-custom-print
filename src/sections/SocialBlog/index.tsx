import { useState, useEffect } from "react";
import { useQuery } from "@animaapp/playground-react-sdk";

// ── Social icons ───────────────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// ── Static fallback posts ──────────────────────────────────────────────────────
const FALLBACK_POSTS = [
  {
    title: "5 Tips for Designing the Perfect School Spirit Wear",
    date: "February 20, 2026",
    category: "Design Tips",
    excerpt:
      "Creating spirit wear that students actually want to wear requires the right combination of school colors, bold graphics, and comfortable materials. Here's what we've learned from hundreds of school orders...",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    readTime: "4 min read",
    link: null as string | null,
  },
  {
    title: "DTF vs Screen Printing: Which is Right for Your Order?",
    date: "February 15, 2026",
    category: "Printing Guide",
    excerpt:
      "Both DTF (Direct to Film) and screen printing produce vibrant results, but each has its strengths depending on your order size, design complexity, and fabric type...",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    readTime: "6 min read",
    link: null as string | null,
  },
  {
    title: "How Web-to-Print Portals Save Schools Time and Money",
    date: "February 8, 2026",
    category: "School Solutions",
    excerpt:
      "Managing school apparel orders used to mean spreadsheets, cash collection, and endless emails. Web-to-print portals change all of that with automated ordering and real-time inventory...",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop",
    readTime: "5 min read",
    link: null as string | null,
  },
];

const socialLinks = [
  {
    name: "Facebook",
    Icon: FacebookIcon,
    bg: "bg-blue-600",
    href: "https://www.facebook.com/profile.php?id=61573013084873",
    followers: "2.4K",
    handle: "@CustomPrintDFW",
  },
  {
    name: "Instagram",
    Icon: InstagramIcon,
    bg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    href: "https://www.instagram.com/customprintdfw",
    followers: "5.1K",
    handle: "@customprintdfw",
  },
  {
    name: "TikTok",
    Icon: TikTokIcon,
    bg: "bg-gray-900",
    href: "https://www.tiktok.com/@customprintdfw",
    followers: "3.8K",
    handle: "@customprintdfw",
  },
  {
    name: "Twitter / X",
    Icon: XIcon,
    bg: "bg-black border border-gray-700",
    href: "https://x.com/CustomPrintDFW",
    followers: "1.2K",
    handle: "@CustomPrintDFW",
  },
];

// ── WordPress post type ────────────────────────────────────────────────────────
type WPPost = {
  id: number;
  link: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      media_details?: { sizes?: { medium_large?: { source_url: string } } };
    }>;
    "wp:term"?: Array<Array<{ name: string }>>;
  };
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

function formatWPDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function getFeaturedImage(post: WPPost): string {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  return (
    media?.media_details?.sizes?.medium_large?.source_url ||
    media?.source_url ||
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
  );
}

function getCategory(post: WPPost): string {
  const terms = post._embedded?.["wp:term"];
  if (terms) {
    for (const group of terms) {
      if (group.length > 0) return group[0].name;
    }
  }
  return "Blog";
}

// ── WordPress blog hook ────────────────────────────────────────────────────────
function useWordPressPosts() {
  const { data: settingsList, isPending: settingsPending } = useQuery("WordPressSettings", {
    where: { label: "main" },
    limit: 1,
  });

  const settings = settingsList?.[0];
  const isEnabled = settings?.enabled === "true" && !!settings?.siteUrl;

  const [posts, setPosts] = useState<typeof FALLBACK_POSTS>(FALLBACK_POSTS);
  const [wpLoading, setWpLoading] = useState(false);
  const [wpError, setWpError] = useState<string | null>(null);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);

  useEffect(() => {
    if (settingsPending || !isEnabled || !settings) return;

    const base = settings.siteUrl.replace(/\/+$/, "");
    const perPage = parseInt(settings.postsPerPage || "3", 10) || 3;
    setSiteUrl(base);

    const headers: Record<string, string> = {};
    if (settings.apiUsername && settings.apiPassword) {
      headers["Authorization"] =
        "Basic " + btoa(`${settings.apiUsername}:${settings.apiPassword}`);
    }

    setWpLoading(true);
    setWpError(null);

    const endpoint = `${base}/wp-json/wp/v2/posts?per_page=${perPage}&_embed`;

    fetch(endpoint, { headers })
      .then((res) => {
        console.log("__ANIMA_DBG__ WordPress fetch response:", {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          headers: Object.fromEntries(res.headers.entries()),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json() as Promise<WPPost[]>;
      })
      .then((wpPosts) => {
        console.log("__ANIMA_DBG__ WordPress posts fetched:", wpPosts.length);
        const mapped = wpPosts.map((p) => ({
          title: stripHtml(p.title.rendered),
          date: formatWPDate(p.date),
          category: getCategory(p),
          excerpt: stripHtml(p.excerpt.rendered).slice(0, 200) + "…",
          image: getFeaturedImage(p),
          readTime: "",
          link: p.link,
        }));
        setPosts(mapped.length > 0 ? mapped : FALLBACK_POSTS);
        setWpError(null);
      })
      .catch((err) => {
        console.error("__ANIMA_DBG__ WordPress fetch error:", {
          message: err.message,
          name: err.name,
          stack: err.stack,
          endpoint,
          hasAuth: !!(settings?.apiUsername && settings?.apiPassword),
        });
        setWpError(err.message);
        setPosts(FALLBACK_POSTS);
      })
      .finally(() => setWpLoading(false));
  }, [settingsPending, isEnabled, settings?.siteUrl, settings?.postsPerPage]);

  return { posts, wpLoading, wpError, isEnabled, siteUrl };
}

// ── Component ──────────────────────────────────────────────────────────────────
export const SocialBlog = () => {
  const { posts, wpLoading, isEnabled, siteUrl } = useWordPressPosts();

  return (
    <div id="social" className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Social Media ── */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-josefin_sans text-black mb-4">
            Follow Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-lime-400 to-yellow-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-montserrat max-w-2xl mx-auto">
            Stay connected for deals, behind-the-scenes content, and print inspiration
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {socialLinks.map(({ name, Icon, bg, href, followers, handle }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div
                className={`${bg} rounded-2xl p-6 text-white text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl`}
              >
                <div className="flex justify-center mb-3">
                  <Icon />
                </div>
                <div className="font-bold font-josefin_sans text-lg">{name}</div>
                <div className="text-white/70 font-montserrat text-xs mt-1">{handle}</div>
                <div className="mt-3 bg-white/20 rounded-full px-3 py-1 inline-block">
                  <span className="font-bold font-montserrat text-sm">{followers}</span>
                  <span className="text-white/70 font-montserrat text-xs ml-1">followers</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* ── Blog ── */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-josefin_sans text-black mb-4">
            Latest from the Blog
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-lime-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-montserrat max-w-2xl mx-auto">
            {isEnabled
              ? "Live posts from our WordPress blog"
              : "Tips, guides, and news from the CustomPrint DFW team"}
          </p>
          {isEnabled && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full font-montserrat">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
              Live from WordPress
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {wpLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <article
                key={i}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-lime-100 text-lime-700 text-xs font-bold px-3 py-1 rounded-full font-montserrat">
                      {post.category}
                    </span>
                    {post.readTime && (
                      <span className="text-gray-400 text-xs font-montserrat">{post.readTime}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold font-josefin_sans text-black mb-3 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 font-montserrat text-sm mb-5 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-gray-400 text-xs font-montserrat">{post.date}</span>
                    {post.link ? (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-bold font-montserrat text-sm hover:text-lime-500 transition-colors flex items-center gap-1"
                      >
                        Read More <span>→</span>
                      </a>
                    ) : (
                      <button className="text-blue-600 font-bold font-montserrat text-sm hover:text-lime-500 transition-colors flex items-center gap-1">
                        Read More <span>→</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          {isEnabled && siteUrl ? (
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-blue-600 to-lime-400 text-white px-12 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-lime-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-montserrat"
            >
              View All Posts
            </a>
          ) : (
            <button className="bg-gradient-to-r from-blue-600 to-lime-400 text-white px-12 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-lime-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-montserrat">
              View All Posts
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

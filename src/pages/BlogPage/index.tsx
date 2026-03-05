import { useState, useEffect } from "react";
import { useQuery } from "@animaapp/playground-react-sdk";
import { Navbar } from "@/sections/Navbar";
import { Loader2, Calendar, Clock, Tag, ExternalLink, AlertCircle } from "lucide-react";

// ── WordPress post type ────────────────────────────────────────────────────────
type WPPost = {
  id: number;
  link: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
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
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop"
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

// ── Static fallback posts ──────────────────────────────────────────────────────
const FALLBACK_POSTS = [
  {
    id: 1,
    title: "5 Tips for Designing the Perfect School Spirit Wear",
    date: "February 20, 2026",
    category: "Design Tips",
    excerpt:
      "Creating spirit wear that students actually want to wear requires the right combination of school colors, bold graphics, and comfortable materials. Here's what we've learned from hundreds of school orders...",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop",
    readTime: "4 min read",
    link: null as string | null,
  },
  {
    id: 2,
    title: "DTF vs Screen Printing: Which is Right for Your Order?",
    date: "February 15, 2026",
    category: "Printing Guide",
    excerpt:
      "Both DTF (Direct to Film) and screen printing produce vibrant results, but each has its strengths depending on your order size, design complexity, and fabric type. Understanding the differences helps you choose the best method for your project...",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    readTime: "6 min read",
    link: null as string | null,
  },
  {
    id: 3,
    title: "How Web-to-Print Portals Save Schools Time and Money",
    date: "February 8, 2026",
    category: "School Solutions",
    excerpt:
      "Managing school apparel orders used to mean spreadsheets, cash collection, and endless emails. Web-to-print portals change all of that with automated ordering and real-time inventory. Here's how schools are streamlining their spirit wear programs...",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop",
    readTime: "5 min read",
    link: null as string | null,
  },
  {
    id: 4,
    title: "Custom Car Wraps: Transform Your Vehicle into a Mobile Billboard",
    date: "February 1, 2026",
    category: "Vehicle Graphics",
    excerpt:
      "Car wraps are one of the most cost-effective forms of advertising. A single vehicle wrap can generate 30,000-70,000 daily impressions. Learn how to design wraps that turn heads and drive business...",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop",
    readTime: "7 min read",
    link: null as string | null,
  },
  {
    id: 5,
    title: "Embroidery vs DTF: Choosing the Right Decoration Method",
    date: "January 25, 2026",
    category: "Printing Guide",
    excerpt:
      "Embroidery offers a premium, textured look that's perfect for polos and hats, while DTF provides vibrant full-color designs on any fabric. Here's how to decide which method is best for your custom apparel project...",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=500&fit=crop",
    readTime: "5 min read",
    link: null as string | null,
  },
  {
    id: 6,
    title: "Designing Effective Banners and Signage for Events",
    date: "January 18, 2026",
    category: "Design Tips",
    excerpt:
      "Great event signage does more than just look good—it guides attendees, reinforces branding, and creates memorable experiences. Follow these design principles to create banners that stand out and communicate clearly...",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
    readTime: "6 min read",
    link: null as string | null,
  },
];

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
    setSiteUrl(base);

    const headers: Record<string, string> = {};
    if (settings.apiUsername && settings.apiPassword) {
      headers["Authorization"] =
        "Basic " + btoa(`${settings.apiUsername}:${settings.apiPassword}`);
    }

    setWpLoading(true);
    setWpError(null);

    fetch(`${base}/wp-json/wp/v2/posts?per_page=100&_embed`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<WPPost[]>;
      })
      .then((wpPosts) => {
        const mapped = wpPosts.map((p) => ({
          id: p.id,
          title: stripHtml(p.title.rendered),
          date: formatWPDate(p.date),
          category: getCategory(p),
          excerpt: stripHtml(p.excerpt.rendered).slice(0, 200) + "…",
          image: getFeaturedImage(p),
          readTime: "",
          link: p.link,
        }));
        setPosts(mapped.length > 0 ? mapped : FALLBACK_POSTS);
      })
      .catch((err) => {
        console.warn("WordPress fetch failed, using fallback posts:", err);
        setWpError(err.message);
        setPosts(FALLBACK_POSTS);
      })
      .finally(() => setWpLoading(false));
  }, [settingsPending, isEnabled, settings?.siteUrl]);

  return { posts, wpLoading, wpError, isEnabled, siteUrl };
}

// ── Component ──────────────────────────────────────────────────────────────────
export const BlogPage = () => {
  const { posts, wpLoading, wpError, isEnabled, siteUrl } = useWordPressPosts();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

  // Filter posts by category
  const filteredPosts =
    selectedCategory === "All" ? posts : posts.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-lime-400 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-josefin_sans text-white mb-6">
            CustomPrint DFW Blog
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-montserrat max-w-3xl mx-auto">
            Tips, guides, and insights from the print industry
          </p>
          {isEnabled && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full font-montserrat">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
              Live from WordPress
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-montserrat font-semibold text-sm transition-all ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-lime-400 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Banner */}
        {wpError && (
          <div className="mb-8 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 font-montserrat">
              <strong>WordPress connection issue:</strong> {wpError}. Showing fallback posts.
            </div>
          </div>
        )}

        {/* Loading State */}
        {wpLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="bg-lime-100 text-lime-700 text-xs font-bold px-3 py-1 rounded-full font-montserrat inline-flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                      {post.readTime && (
                        <span className="text-gray-400 text-xs font-montserrat inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-josefin_sans text-black mb-3 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 font-montserrat text-sm mb-5 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-gray-400 text-xs font-montserrat inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      {post.link ? (
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-bold font-montserrat text-sm hover:text-lime-500 transition-colors flex items-center gap-1"
                        >
                          Read More <ExternalLink className="w-4 h-4" />
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

            {/* No Results */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 font-montserrat text-lg">
                  No posts found in this category.
                </p>
              </div>
            )}
          </>
        )}

        {/* WordPress Link */}
        {isEnabled && siteUrl && (
          <div className="mt-16 text-center">
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-lime-400 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-lime-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-montserrat"
            >
              Visit Full WordPress Blog <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 font-montserrat text-sm">
            © Copyright 2026 CustomPrintDFW. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

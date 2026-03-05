import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import type { WordPressSettingsDraft } from "@animaapp/playground-react-sdk";
import {
  Globe,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  ToggleLeft,
  ToggleRight,
  Info,
  Wifi,
  WifiOff,
  RefreshCw,
  Hash,
} from "lucide-react";

// ── WordPress logo ─────────────────────────────────────────────────────────────
const WPLogo = () => (
  <svg viewBox="0 0 122.52 122.523" className="w-8 h-8" fill="#21759b" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298L13.258 39.872a52.354 52.354 0 0 0-4.55 21.388zM96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501L48.2 93.547l11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989zM61.262 65.57l-15.75 45.79a52.476 52.476 0 0 0 14.516 2.04 52.57 52.57 0 0 0 16.942-2.822L61.262 65.57zm45.112-29.747a41.2 41.2 0 0 1 .358 5.496c0 5.497-1.028 11.661-4.094 19.324l-16.44 47.554c16.008-9.328 26.774-26.679 26.774-46.485a52.4 52.4 0 0 0-6.598-25.889z"/>
    <path d="M1.376 61.26C1.376 94.291 28.231 121.147 61.262 121.147c33.031 0 59.887-26.856 59.887-59.887 0-33.031-26.856-59.887-59.887-59.887C28.231 1.373 1.376 28.229 1.376 61.26zm4.327 0C5.703 30.602 30.604 5.7 61.262 5.7c30.657 0 55.559 24.902 55.559 55.56 0 30.657-24.902 55.559-55.559 55.559-30.658 0-55.559-24.902-55.559-55.559z"/>
  </svg>
);

// ── Shared sub-components ──────────────────────────────────────────────────────
const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 font-montserrat mt-1">{hint}</p>}
  </div>
);

const SecretInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-blue-700 font-montserrat space-y-2">{children}</div>
  </div>
);

const Step = ({ n, text }: { n: number; text: React.ReactNode }) => (
  <div className="flex gap-3 items-start">
    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
      {n}
    </span>
    <span>{text}</span>
  </div>
);

// ── Connection test result type ────────────────────────────────────────────────
type TestStatus = "idle" | "testing" | "success" | "error";

// ── Main component ─────────────────────────────────────────────────────────────
export const WordPressAdmin = () => {
  const { data: settingsList, isPending, error } = useQuery("WordPressSettings", {
    where: { label: "main" },
    limit: 1,
  });

  const { create, update, isPending: isSaving, error: saveError } = useMutation("WordPressSettings");

  const existing = settingsList?.[0];

  const [siteUrl, setSiteUrl] = useState("");
  const [apiUsername, setApiUsername] = useState("");
  const [apiPassword, setApiPassword] = useState("");
  const [postsPerPage, setPostsPerPage] = useState("3");
  const [enabled, setEnabled] = useState(false);

  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState("");
  const [testPostCount, setTestPostCount] = useState<number | null>(null);

  // Populate form from DB
  useEffect(() => {
    if (!existing) return;
    setSiteUrl(existing.siteUrl || "");
    setApiUsername(existing.apiUsername || "");
    setApiPassword(existing.apiPassword || "");
    setPostsPerPage(existing.postsPerPage || "3");
    setEnabled(existing.enabled === "true");
  }, [existing]);

  // Normalise URL — strip trailing slash
  const normaliseUrl = (url: string) => url.replace(/\/+$/, "");

  const handleTestConnection = async () => {
    if (!siteUrl) {
      setTestStatus("error");
      setTestMessage("Please enter your WordPress site URL first.");
      return;
    }
    setTestStatus("testing");
    setTestMessage("");
    setTestPostCount(null);

    try {
      const base = normaliseUrl(siteUrl);
      const headers: Record<string, string> = {};
      if (apiUsername && apiPassword) {
        headers["Authorization"] = "Basic " + btoa(`${apiUsername}:${apiPassword}`);
      }

      const endpoint = `${base}/wp-json/wp/v2/posts?per_page=1&_fields=id,title`;

      const res = await fetch(endpoint, { headers });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}${body ? ": " + body.slice(0, 120) : ""}`);
      }

      const totalHeader = res.headers.get("X-WP-Total");
      const total = totalHeader ? parseInt(totalHeader, 10) : null;
      setTestPostCount(total);
      setTestStatus("success");
      setTestMessage(
        total !== null
          ? `Connected! Found ${total} published post${total !== 1 ? "s" : ""} on your WordPress site.`
          : "Connected to WordPress REST API successfully."
      );
    } catch (err: unknown) {
      setTestStatus("error");
      const msg = err instanceof Error ? err.message : String(err);
      setTestMessage(
        msg.includes("Failed to fetch") || msg.includes("NetworkError")
          ? "Could not reach the WordPress site. Check the URL and make sure the REST API is enabled (Settings → Permalinks → Save)."
          : msg
      );
    }
  };

  const handleSave = async () => {
    const draft: WordPressSettingsDraft = {
      label: "main",
      siteUrl: normaliseUrl(siteUrl),
      apiUsername,
      apiPassword,
      postsPerPage: postsPerPage || "3",
      enabled: enabled ? "true" : "false",
    };
    try {
      if (existing) {
        await update(existing.id, draft);
      } else {
        await create(draft);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save WordPress settings:", err);
    }
  };

  if (isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 font-montserrat">
        Error loading WordPress settings: {error.message}
      </div>
    );
  }

  const isConfigured = !!(siteUrl && apiUsername && apiPassword);
  const isActive = enabled && isConfigured;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-josefin_sans text-gray-900 mb-1">WordPress Blog</h2>
        <p className="text-gray-500 font-montserrat text-sm">
          Connect your WordPress site to display live blog posts on the homepage.
        </p>
      </div>

      {/* Status banner */}
      <div
        className={`flex items-center gap-3 rounded-xl px-5 py-4 mb-8 border-2 ${
          isActive
            ? "bg-green-50 border-green-200"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        {isActive ? (
          <Wifi className="w-5 h-5 text-green-500 flex-shrink-0" />
        ) : (
          <WifiOff className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className={`font-bold font-montserrat text-sm ${isActive ? "text-green-700" : "text-gray-500"}`}>
            {isActive
              ? `WordPress connected — ${normaliseUrl(siteUrl)}`
              : isConfigured
              ? "WordPress configured but not enabled"
              : "WordPress blog not connected"}
          </p>
          <p className="text-xs font-montserrat text-gray-400 mt-0.5">
            {isActive
              ? `Showing up to ${postsPerPage} live posts on the blog section.`
              : "Fill in your WordPress credentials below and enable the integration."}
          </p>
        </div>
        {/* Master toggle */}
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className={`flex items-center gap-1.5 text-sm font-bold font-montserrat transition-colors ${
            enabled ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-gray-600"
          }`}
          title={enabled ? "Disable WordPress integration" : "Enable WordPress integration"}
        >
          {enabled ? (
            <ToggleRight className="w-8 h-8" />
          ) : (
            <ToggleLeft className="w-8 h-8" />
          )}
          {enabled ? "On" : "Off"}
        </button>
      </div>

      {/* How-to instructions */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <WPLogo />
          <div>
            <span className="font-bold font-josefin_sans text-gray-800 block">WordPress REST API Setup</span>
            <span className="text-xs text-gray-400 font-montserrat">Uses Application Passwords (WordPress 5.6+)</span>
          </div>
        </div>

        <InfoBox>
          <Step
            n={1}
            text={
              <>
                Make sure your WordPress site has{" "}
                <strong>pretty permalinks</strong> enabled. Go to{" "}
                <strong>Settings → Permalinks</strong> and choose any option other than "Plain", then click Save.
              </>
            }
          />
          <Step
            n={2}
            text={
              <>
                In your WordPress dashboard go to{" "}
                <strong>Users → Profile</strong> (or edit any user).
              </>
            }
          />
          <Step
            n={3}
            text={
              <>
                Scroll down to the <strong>Application Passwords</strong> section. Enter a name (e.g. "CustomPrint Site") and click{" "}
                <strong>Add New Application Password</strong>.
              </>
            }
          />
          <Step
            n={4}
            text="Copy the generated password (it won't be shown again) and paste it below along with your WordPress username."
          />
          <Step
            n={5}
            text={
              <>
                Enter your site URL below (e.g.{" "}
                <code className="bg-blue-100 px-1 rounded text-xs">https://www.customprintdfw.com/blog</code>
                ), then click <strong>Test Connection</strong> to verify.
              </>
            }
          />
        </InfoBox>

        {/* Site URL */}
        <Field
          label="WordPress Site URL *"
          hint="The root URL of your WordPress site — no trailing slash needed."
        >
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://www.customprintdfw.com/blog"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
            />
          </div>
        </Field>

        {/* Username */}
        <Field
          label="WordPress Username *"
          hint="Your WordPress login username (not email)."
        >
          <input
            type="text"
            value={apiUsername}
            onChange={(e) => setApiUsername(e.target.value)}
            placeholder="admin"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
          />
        </Field>

        {/* Application Password */}
        <Field
          label="Application Password *"
          hint="Generated from Users → Profile → Application Passwords in your WordPress dashboard."
        >
          <SecretInput
            value={apiPassword}
            onChange={setApiPassword}
            placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
          />
        </Field>

        {/* Posts per page */}
        <Field
          label="Posts to Display"
          hint="How many recent posts to show in the blog section (1–12)."
        >
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={1}
              max={12}
              value={postsPerPage}
              onChange={(e) => setPostsPerPage(e.target.value)}
              className="w-32 pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
            />
          </div>
        </Field>

        {/* Test connection */}
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === "testing" || !siteUrl}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold font-montserrat text-sm transition-all"
          >
            {testStatus === "testing" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Testing…
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" /> Test Connection
              </>
            )}
          </button>

          {testStatus === "success" && (
            <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-montserrat">{testMessage}</p>
            </div>
          )}
          {testStatus === "error" && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-montserrat">{testMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* CORS note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700 font-montserrat">
        <strong>CORS note:</strong> Your WordPress server must allow cross-origin requests from this site's domain. If you see CORS errors, install the{" "}
        <a
          href="https://wordpress.org/plugins/wp-cors/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline inline-flex items-center gap-0.5"
        >
          WP CORS plugin <ExternalLink className="w-3 h-3" />
        </a>{" "}
        or add the appropriate{" "}
        <code className="bg-amber-100 px-1 rounded text-xs">Access-Control-Allow-Origin</code> header in your server config.
      </div>

      {/* Save error */}
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-montserrat text-sm">
          {saveError.message}
        </div>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-lime-400 text-white px-8 py-3.5 rounded-xl font-bold font-montserrat text-base hover:from-blue-700 hover:to-lime-500 disabled:opacity-50 transition-all shadow-md"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving…
          </>
        ) : saved ? (
          <>
            <CheckCircle className="w-5 h-5" /> Saved!
          </>
        ) : (
          <>
            <Save className="w-5 h-5" /> Save WordPress Settings
          </>
        )}
      </button>

      {saved && (
        <p className="mt-3 text-sm text-green-600 font-montserrat font-semibold">
          ✓ Settings saved. The blog section will now pull posts from your WordPress site.
        </p>
      )}

      {/* Quick reference */}
      <div className="mt-10 bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold font-josefin_sans text-gray-800 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" /> WordPress REST API Reference
        </h3>
        <p className="text-xs text-gray-500 font-montserrat mb-3">
          Once connected, the site fetches posts from:
        </p>
        <code className="block bg-white border border-gray-200 rounded-lg px-4 py-3 text-xs font-mono text-gray-700 break-all">
          {siteUrl
            ? `${normaliseUrl(siteUrl)}/wp-json/wp/v2/posts?per_page=${postsPerPage}&_embed`
            : "https://www.customprintdfw.com/blog/wp-json/wp/v2/posts?per_page=3&_embed"}
        </code>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://developer.wordpress.org/rest-api/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline font-montserrat inline-flex items-center gap-1"
          >
            WP REST API Docs <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline font-montserrat inline-flex items-center gap-1"
          >
            Application Passwords Guide <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

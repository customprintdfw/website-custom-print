export const NavbarLogo = () => {
  return (
    <div className="flex items-center gap-4 flex-shrink-0">
      <a href="/" className="flex items-center">
        <img
          src="https://c.animaapp.com/mm19g6djl5wbUX/img/uploaded-asset-1771977209008-0.png"
          alt="CustomPrint DFW"
          className="h-16 w-auto"
        />
      </a>
      <div className="flex items-center gap-2">
        {/* Facebook */}
        <a
          href="https://www.facebook.com/profile.php?id=61573013084873"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-blue-600 transition-colors duration-200"
          aria-label="Facebook"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>
        {/* Instagram */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-pink-600 transition-colors duration-200"
          aria-label="Instagram"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
        {/* TikTok */}
        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-black hover:ring-2 hover:ring-lime-400 transition-colors duration-200"
          aria-label="TikTok"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
          </svg>
        </a>
        {/* X / Twitter */}
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-gray-700 transition-colors duration-200"
          aria-label="X (Twitter)"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

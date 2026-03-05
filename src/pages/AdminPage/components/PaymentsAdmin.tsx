import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import type { PaymentSettingsDraft } from "@animaapp/playground-react-sdk";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";

// ── PayPal logo SVG ────────────────────────────────────────────────────────────
const PayPalLogo = () => (
  <svg viewBox="0 0 124 33" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M46.2 6.8h-8.4c-.6 0-1.1.4-1.2 1l-3.4 21.5c-.1.4.2.8.6.8h4c.6 0 1.1-.4 1.2-1l.9-5.8c.1-.6.6-1 1.2-1h2.7c5.5 0 8.7-2.7 9.5-7.9.4-2.3 0-4.1-1-5.4-1.2-1.4-3.2-2.2-6.1-2.2z" fill="#003087"/>
    <path d="M47.1 14.7c-.5 3-2.8 3-5 3h-1.3l.9-5.6c.1-.3.4-.6.7-.6h.6c1.5 0 3 0 3.7.9.4.5.5 1.3.4 2.3z" fill="#003087"/>
    <path d="M68.5 14.6h-4c-.3 0-.6.2-.7.6l-.2 1-.3-.4c-.9-1.3-2.8-1.7-4.8-1.7-4.5 0-8.3 3.4-9 8.1-.4 2.4.2 4.6 1.5 6.2 1.2 1.4 3 2 5.1 2 3.6 0 5.6-2.3 5.6-2.3l-.2 1c-.1.4.2.8.6.8h3.6c.6 0 1.1-.4 1.2-1l2.2-13.5c.1-.4-.2-.8-.6-.8zm-5.6 7.8c-.4 2.2-2.1 3.7-4.4 3.7-1.1 0-2-.4-2.6-1-.6-.7-.8-1.6-.6-2.7.3-2.2 2.1-3.7 4.3-3.7 1.1 0 2 .4 2.6 1 .6.7.9 1.6.7 2.7z" fill="#003087"/>
    <path d="M88.3 14.6h-4c-.4 0-.7.2-.9.5l-5.3 7.8-2.2-7.5c-.1-.5-.6-.8-1-.8h-4c-.5 0-.8.5-.6.9l4.2 12.3-4 5.6c-.3.4 0 1 .5 1h4c.4 0 .7-.2.9-.5l12.8-18.5c.3-.4 0-1-.4-1z" fill="#003087"/>
    <path d="M100.2 6.8h-8.4c-.6 0-1.1.4-1.2 1l-3.4 21.5c-.1.4.2.8.6.8h4.3c.4 0 .8-.3.8-.7l1-6.1c.1-.6.6-1 1.2-1h2.7c5.5 0 8.7-2.7 9.5-7.9.4-2.3 0-4.1-1-5.4-1.2-1.4-3.2-2.2-6.1-2.2z" fill="#009cde"/>
    <path d="M101.1 14.7c-.5 3-2.8 3-5 3h-1.3l.9-5.6c.1-.3.4-.6.7-.6h.6c1.5 0 3 0 3.7.9.4.5.5 1.3.4 2.3z" fill="#009cde"/>
    <path d="M122.4 14.6h-4c-.3 0-.6.2-.7.6l-.2 1-.3-.4c-.9-1.3-2.8-1.7-4.8-1.7-4.5 0-8.3 3.4-9 8.1-.4 2.4.2 4.6 1.5 6.2 1.2 1.4 3 2 5.1 2 3.6 0 5.6-2.3 5.6-2.3l-.2 1c-.1.4.2.8.6.8h3.6c.6 0 1.1-.4 1.2-1l2.2-13.5c.1-.4-.2-.8-.6-.8zm-5.6 7.8c-.4 2.2-2.1 3.7-4.4 3.7-1.1 0-2-.4-2.6-1-.6-.7-.8-1.6-.6-2.7.3-2.2 2.1-3.7 4.3-3.7 1.1 0 2 .4 2.6 1 .6.7.9 1.6.7 2.7z" fill="#009cde"/>
    <path d="M10.2 33l.6-4H9.4L3 0H13.8l3.8 21.4L24.2 0H35L17.6 33H10.2z" fill="#003087"/>
  </svg>
);

// ── Square logo SVG ────────────────────────────────────────────────────────────
const SquareLogo = () => (
  <svg viewBox="0 0 120 32" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#3E4348"/>
    <rect x="8" y="8" width="16" height="16" rx="2" fill="white"/>
    <text x="40" y="23" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#3E4348">Square</text>
  </svg>
);

// ── Field ──────────────────────────────────────────────────────────────────────
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

// ── Secret input ───────────────────────────────────────────────────────────────
const SecretInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
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

// ── Mode selector ──────────────────────────────────────────────────────────────
const ModeSelector = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; color: string }[];
}) => (
  <div className="flex gap-2">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`flex-1 py-2 rounded-lg text-sm font-bold font-montserrat border-2 transition-all ${
          value === opt.value
            ? `${opt.color} border-transparent`
            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// ── Info box ───────────────────────────────────────────────────────────────────
const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-blue-700 font-montserrat space-y-1">{children}</div>
  </div>
);

// ── Step badge ─────────────────────────────────────────────────────────────────
const Step = ({ n, text }: { n: number; text: React.ReactNode }) => (
  <div className="flex gap-3 items-start">
    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
      {n}
    </span>
    <span>{text}</span>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
export const PaymentsAdmin = () => {
  const { data: settingsList, isPending, error } = useQuery("PaymentSettings", {
    where: { label: "main" },
    limit: 1,
  });

  const { create, update, isPending: isSaving, error: saveError } = useMutation("PaymentSettings");

  const existing = settingsList?.[0];

  const [provider, setProvider] = useState<"none" | "paypal" | "square">("none");
  const [enabled, setEnabled] = useState(false);

  // PayPal
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalMode, setPaypalMode] = useState<"sandbox" | "production">("sandbox");

  // Square
  const [squareAppId, setSquareAppId] = useState("");
  const [squareLocationId, setSquareLocationId] = useState("");
  const [squareEnvironment, setSquareEnvironment] = useState<"sandbox" | "production">("sandbox");

  const [saved, setSaved] = useState(false);

  // Populate form from DB
  useEffect(() => {
    if (!existing) return;
    setProvider((existing.provider as "none" | "paypal" | "square") || "none");
    setEnabled(existing.enabled === "true");
    setPaypalClientId(existing.paypalClientId || "");
    setPaypalMode((existing.paypalMode as "sandbox" | "production") || "sandbox");
    setSquareAppId(existing.squareAppId || "");
    setSquareLocationId(existing.squareLocationId || "");
    setSquareEnvironment((existing.squareEnvironment as "sandbox" | "production") || "sandbox");
  }, [existing]);

  const handleSave = async () => {
    const draft: PaymentSettingsDraft = {
      label: "main",
      provider,
      enabled: enabled ? "true" : "false",
      paypalClientId,
      paypalMode,
      squareAppId,
      squareLocationId,
      squareEnvironment,
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
      console.error("Failed to save payment settings:", err);
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
        Error loading payment settings: {error.message}
      </div>
    );
  }

  const isActive = enabled && provider !== "none";

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-josefin_sans text-gray-900 mb-1">Payment Setup</h2>
        <p className="text-gray-500 font-montserrat text-sm">
          Connect PayPal or Square to accept online payments from customers.
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
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className={`font-bold font-montserrat text-sm ${isActive ? "text-green-700" : "text-gray-500"}`}>
            {isActive
              ? `Online payments active via ${provider === "paypal" ? "PayPal" : "Square"} (${provider === "paypal" ? paypalMode : squareEnvironment})`
              : "Online payments are not active"}
          </p>
          <p className="text-xs font-montserrat text-gray-400 mt-0.5">
            {isActive
              ? "Customers can pay online when placing orders."
              : "Select a provider below and enter your credentials to enable."}
          </p>
        </div>
        {/* Master toggle */}
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className={`flex items-center gap-1.5 text-sm font-bold font-montserrat transition-colors ${
            enabled ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-gray-600"
          }`}
          title={enabled ? "Disable payments" : "Enable payments"}
        >
          {enabled ? (
            <ToggleRight className="w-8 h-8" />
          ) : (
            <ToggleLeft className="w-8 h-8" />
          )}
          {enabled ? "On" : "Off"}
        </button>
      </div>

      {/* Provider selector */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6 shadow-sm">
        <p className="text-sm font-bold text-gray-700 font-montserrat mb-4">Choose Payment Provider</p>
        <div className="grid grid-cols-3 gap-3">
          {(["none", "paypal", "square"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={`flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 transition-all ${
                provider === p
                  ? "border-lime-400 bg-lime-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {p === "none" && (
                <>
                  <CreditCard className="w-7 h-7 text-gray-300" />
                  <span className="text-xs font-bold font-montserrat text-gray-400">None</span>
                </>
              )}
              {p === "paypal" && (
                <>
                  <PayPalLogo />
                  <span className="text-xs font-bold font-montserrat text-[#003087]">PayPal</span>
                </>
              )}
              {p === "square" && (
                <>
                  <SquareLogo />
                  <span className="text-xs font-bold font-montserrat text-[#3E4348]">Square</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* PayPal config */}
      {provider === "paypal" && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <PayPalLogo />
            <span className="font-bold font-josefin_sans text-gray-800">PayPal Configuration</span>
          </div>

          <InfoBox>
            <Step
              n={1}
              text={
                <>
                  Go to{" "}
                  <a
                    href="https://developer.paypal.com/dashboard/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold inline-flex items-center gap-0.5"
                  >
                    developer.paypal.com <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  and sign in.
                </>
              }
            />
            <Step n={2} text="Create an App under My Apps & Credentials." />
            <Step n={3} text="Copy the Client ID for Sandbox (testing) or Live (production)." />
            <Step n={4} text="Paste it below and set the matching mode." />
          </InfoBox>

          <Field
            label="Client ID *"
            hint="Found in your PayPal Developer Dashboard under your app's credentials."
          >
            <SecretInput
              value={paypalClientId}
              onChange={setPaypalClientId}
              placeholder="AaBbCcDd... (sandbox or live client ID)"
            />
          </Field>

          <Field label="Mode">
            <ModeSelector
              value={paypalMode}
              onChange={(v) => setPaypalMode(v as "sandbox" | "production")}
              options={[
                { value: "sandbox", label: "🧪 Sandbox (Test)", color: "bg-yellow-100 text-yellow-700" },
                { value: "production", label: "🚀 Production (Live)", color: "bg-green-100 text-green-700" },
              ]}
            />
          </Field>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 font-montserrat">
            <strong>Integration note:</strong> After saving, add the PayPal JS SDK script to your checkout page using this Client ID. See{" "}
            <a
              href="https://developer.paypal.com/sdk/js/reference/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-0.5"
            >
              PayPal JS SDK docs <ExternalLink className="w-3 h-3" />
            </a>
            .
          </div>
        </div>
      )}

      {/* Square config */}
      {provider === "square" && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <SquareLogo />
            <span className="font-bold font-josefin_sans text-gray-800">Square Configuration</span>
          </div>

          <InfoBox>
            <Step
              n={1}
              text={
                <>
                  Go to{" "}
                  <a
                    href="https://developer.squareup.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold inline-flex items-center gap-0.5"
                  >
                    developer.squareup.com/apps <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  and create an application.
                </>
              }
            />
            <Step n={2} text="Under Credentials, copy the Application ID." />
            <Step
              n={3}
              text={
                <>
                  Go to{" "}
                  <a
                    href="https://squareup.com/dashboard/locations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold inline-flex items-center gap-0.5"
                  >
                    squareup.com/dashboard/locations <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  and copy your Location ID.
                </>
              }
            />
            <Step n={4} text="Paste both below and choose Sandbox or Production." />
          </InfoBox>

          <Field
            label="Application ID *"
            hint="Found in your Square Developer Dashboard under Credentials."
          >
            <SecretInput
              value={squareAppId}
              onChange={setSquareAppId}
              placeholder="sq0idp-... (sandbox or production)"
            />
          </Field>

          <Field
            label="Location ID *"
            hint="Found in your Square Dashboard under Locations."
          >
            <input
              type="text"
              value={squareLocationId}
              onChange={(e) => setSquareLocationId(e.target.value)}
              placeholder="L... (your Square location ID)"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
            />
          </Field>

          <Field label="Environment">
            <ModeSelector
              value={squareEnvironment}
              onChange={(v) => setSquareEnvironment(v as "sandbox" | "production")}
              options={[
                { value: "sandbox", label: "🧪 Sandbox (Test)", color: "bg-yellow-100 text-yellow-700" },
                { value: "production", label: "🚀 Production (Live)", color: "bg-green-100 text-green-700" },
              ]}
            />
          </Field>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 font-montserrat">
            <strong>Integration note:</strong> After saving, load the Square Web Payments SDK on your checkout page using these credentials. See{" "}
            <a
              href="https://developer.squareup.com/docs/web-payments/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-0.5"
            >
              Square Web Payments docs <ExternalLink className="w-3 h-3" />
            </a>
            .
          </div>
        </div>
      )}

      {/* Save button */}
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-montserrat text-sm">
          {saveError.message}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-lime-400 text-white px-8 py-3.5 rounded-xl font-bold font-montserrat text-base hover:from-blue-700 hover:to-lime-500 disabled:opacity-50 transition-all shadow-md"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <CheckCircle className="w-5 h-5" /> Saved!
          </>
        ) : (
          <>
            <Save className="w-5 h-5" /> Save Payment Settings
          </>
        )}
      </button>

      {saved && (
        <p className="mt-3 text-sm text-green-600 font-montserrat font-semibold">
          ✓ Settings saved successfully. Your payment configuration is stored.
        </p>
      )}
    </div>
  );
};

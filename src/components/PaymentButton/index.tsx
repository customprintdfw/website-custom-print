import { useEffect, useRef, useState } from 'react';
import type { PaymentSettings } from '@animaapp/playground-react-sdk';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentButtonProps {
  /** Numeric string, e.g. "15.99" */
  amount: string;
  currency?: string;
  settings: PaymentSettings;
  onSuccess: (details?: any) => void;
  onError: (message: string) => void;
  /** Called when the user wants to place the order without online payment (e.g. SDK failed to load) */
  onSkipPayment?: () => void;
}

function loadScript(src: string, existingSelector?: string, timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const sel = existingSelector || `script[src="${src}"]`;
    if (document.querySelector(sel)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;

    const timer = setTimeout(() => {
      reject(new Error('Payment SDK timed out. Check your internet connection and try again.'));
    }, timeoutMs);

    s.onload = () => { clearTimeout(timer); resolve(); };
    s.onerror = () => {
      clearTimeout(timer);
      reject(new Error(
        'Could not load the payment SDK. This is often caused by a network restriction or SSL error (ERR_SSL_VERSION_OR_CIPHER_MISMATCH) in the current environment.'
      ));
    };
    document.head.appendChild(s);
  });
}

export const PaymentButton = ({
  amount,
  currency = 'USD',
  settings,
  onSuccess,
  onError,
  onSkipPayment,
}: PaymentButtonProps) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [squareCard, setSquareCard] = useState<any>(null);
  const [squarePaying, setSquarePaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const paypalRendered = useRef(false);

  const { provider, paypalClientId, squareAppId, squareLocationId, squareEnvironment } = settings;

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (provider === 'paypal') {
          if (!paypalClientId) {
            throw new Error('PayPal Client ID is not configured. Please check Admin → Payments.');
          }

          // Load SDK if not already present
          if (!(window as any).paypal) {
            await loadScript(
              `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalClientId)}&currency=${currency}&intent=capture`,
              'script[src*="paypal.com/sdk/js"]'
            );
          }

          if (!mounted) return;

          // Wait for global to be available
          let attempts = 0;
          while (!(window as any).paypal && attempts < 30) {
            await new Promise((r) => setTimeout(r, 100));
            attempts++;
          }
          if (!(window as any).paypal) throw new Error('PayPal SDK failed to initialize.');
          if (!mounted) return;

          setStatus('ready');

          // Render buttons after DOM settles
          await new Promise((r) => setTimeout(r, 80));
          if (!mounted || !paypalRef.current || paypalRendered.current) return;
          paypalRendered.current = true;
          paypalRef.current.innerHTML = '';

          (window as any).paypal
            .Buttons({
              style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay', height: 48 },
              createOrder: (_data: any, actions: any) =>
                actions.order.create({
                  purchase_units: [{ amount: { value: amount, currency_code: currency } }],
                }),
              onApprove: async (_data: any, actions: any) => {
                const details = await actions.order.capture();
                if (mounted) onSuccess(details);
              },
              onError: (err: any) => {
                if (mounted) setPaymentError(err?.message || 'PayPal payment failed. Please try again.');
              },
            })
            .render(paypalRef.current);

        } else if (provider === 'square') {
          if (!squareAppId || !squareLocationId) {
            throw new Error('Square credentials are not fully configured. Please check Admin → Payments.');
          }

          const isSandbox = squareEnvironment !== 'production';
          const sdkUrl = isSandbox
            ? 'https://sandbox.web.squarecdn.com/v1/square.js'
            : 'https://web.squarecdn.com/v1/square.js';

          await loadScript(sdkUrl, 'script[src*="squarecdn.com"]');
          if (!mounted) return;

          const Square = (window as any).Square;
          if (!Square) throw new Error('Square SDK not available.');

          const payments = Square.payments(squareAppId, squareLocationId);
          const card = await payments.card();
          if (!mounted) return;

          if (squareRef.current) {
            squareRef.current.innerHTML = '';
            await card.attach(squareRef.current);
          }

          if (mounted) {
            setSquareCard(card);
            setStatus('ready');
          }
        }
      } catch (err: any) {
        if (mounted) {
          setErrorMsg(err?.message || 'Failed to load payment options.');
          setStatus('error');
        }
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSquarePay = async () => {
    if (!squareCard) return;
    setSquarePaying(true);
    setPaymentError('');
    try {
      const result = await squareCard.tokenize();
      if (result.status === 'OK') {
        onSuccess({ token: result.token, details: result.details });
      } else {
        const msg =
          result.errors?.map((e: any) => e.message).join(', ') ||
          'Card verification failed. Please check your card details.';
        setPaymentError(msg);
      }
    } catch (err: any) {
      setPaymentError(err?.message || 'Payment processing failed. Please try again.');
    } finally {
      setSquarePaying(false);
    }
  };

  /* ── Error state ── */
  if (status === 'error') {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4 text-sm font-montserrat">
          <p className="font-bold mb-1">⚠️ Online payment unavailable</p>
          <p className="text-xs mt-1 leading-relaxed">{errorMsg}</p>
        </div>
        {onSkipPayment && (
          <button
            type="button"
            onClick={onSkipPayment}
            className="w-full bg-gray-800 text-white py-3.5 rounded-xl font-bold font-montserrat hover:bg-gray-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            Place Order — Pay Later / In Person
          </button>
        )}
        {!onSkipPayment && (
          <p className="text-xs text-red-500 font-montserrat text-center">
            You can still place your order — we'll contact you about payment.
          </p>
        )}
      </div>
    );
  }

  /* ── Loading state ── */
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-8 gap-3 text-gray-500 font-montserrat text-sm">
        <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        Loading payment options…
      </div>
    );
  }

  /* ── Ready ── */
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-gray-400 font-montserrat">
        <Lock className="w-3 h-3 flex-shrink-0" />
        <span>Secure payment</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {provider === 'paypal' && (
        <>
          <div ref={paypalRef} className="w-full min-h-[50px]" />
          {paymentError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-montserrat">
              {paymentError}
            </div>
          )}
        </>
      )}

      {provider === 'square' && (
        <>
          <div ref={squareRef} className="min-h-[90px]" />
          <button
            type="button"
            onClick={handleSquarePay}
            disabled={squarePaying || !squareCard}
            className="w-full bg-[#3E4348] text-white py-3.5 rounded-xl font-bold font-montserrat hover:bg-[#2d3136] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {squarePaying ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay ${amount}
              </>
            )}
          </button>
          {paymentError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-montserrat">
              {paymentError}
            </div>
          )}
        </>
      )}
    </div>
  );
};

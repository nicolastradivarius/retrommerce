"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Frame, Cursor } from "@react95/core";
import { formatPrice } from "@/lib/utils";
import type { CartWithItems } from "@/lib/cart";
import styles from "./CheckoutForm.module.css";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

interface CardFormData {
  token: string;
  installments: number;
  selectedPaymentMethodType: string;
  selectedPaymentMethodId: string;
  issuerId: string;
  payerEmail: string;
  identificationNumber: string;
  identificationType: string;
}

interface MPCardForm {
  getCardFormData: () => CardFormData;
  unmount: () => void;
}

// Extend window with MercadoPago types
declare global {
  interface Window {
    MercadoPago: new (
      publicKey: string,
      options?: { locale?: string },
    ) => {
      cardForm: (config: unknown) => MPCardForm;
    };
  }
}

export interface CheckoutFormDict {
  title: string;
  addressStep: string;
  paymentStep: string;
  orderSummary: string;
  cardNumber: string;
  cardNumberPlaceholder: string;
  expirationDate: string;
  expirationDatePlaceholder: string;
  securityCode: string;
  securityCodePlaceholder: string;
  cardholderName: string;
  cardholderNamePlaceholder: string;
  identificationType: string;
  identificationNumber: string;
  identificationNumberPlaceholder: string;
  installments: string;
  issuer: string;
  pay: string;
  processing: string;
  paymentError: string;
  connectionError: string;
  subtotal: string;
  shipping: string;
  shippingFree: string;
  total: string;
  items: string;
  backToCart: string;
  loadingMP: string;
  selectedAddress: string;
  changeAddress: string;
}

interface CheckoutFormProps {
  addresses: Address[];
  cart: CartWithItems;
  lang: string;
  mpPublicKey: string;
  dict: CheckoutFormDict;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function AddressLine({ address }: { address: Address }) {
  return (
    <span>
      {address.fullName} — {address.street}, {address.city}, {address.state}{" "}
      {address.zipCode}, {address.country}
      {address.phone ? ` · ${address.phone}` : ""}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

// Maps the app's locale to MercadoPago's expected locale format.
// MP supported locales: es-AR, es-MX, es-CL, es-CO, es-PE, es-UY, en-US, pt-BR.
const MP_LOCALE_MAP: Record<string, string> = {
  es: "es-AR",
  en: "en-US",
};

export default function CheckoutForm({
  addresses,
  cart,
  lang,
  mpPublicKey,
  dict,
}: CheckoutFormProps) {
  const router = useRouter();

  // Address state
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?.id ?? "",
  );
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // Payment state
  const [isMPReady, setIsMPReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We store selectedAddressId in a ref so the MP onSubmit callback
  // always reads the latest value without re-mounting the CardForm.
  const selectedAddressIdRef = useRef(selectedAddressId);
  const cardFormRef = useRef<MPCardForm | null>(null);

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    selectedAddressIdRef.current = id;
    setShowAddressPicker(false);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // ── MercadoPago CardForm init ──────────────────────────────────────────────

  useEffect(() => {
    if (!mpPublicKey) return;

    let mounted = true;

    const initCardForm = async () => {
      try {
        // Load the MP.js script dynamically (injects <script> tag into <head>)
        const { loadMercadoPago } = await import("@mercadopago/sdk-js");
        await loadMercadoPago();

        if (!mounted) return;

        const mpLocale = MP_LOCALE_MAP[lang] ?? "en-US";
        const mp = new window.MercadoPago(mpPublicKey, { locale: mpLocale });

        const cardForm = mp.cardForm({
          amount: cart.subtotal,
          // iframe: false → regular HTML inputs (full styling control).
          // For production PCI compliance, switch to iframe: true.
          // Note: with iframe: true the card number / CVV / expiry inputs become
          // iframes and cannot be styled via CSS Modules.
          iframe: false,
          form: {
            id: "checkout-card-form",
            cardNumber: {
              id: "mp-cardNumber",
              placeholder: dict.cardNumberPlaceholder,
            },
            expirationDate: {
              id: "mp-expirationDate",
              placeholder: dict.expirationDatePlaceholder,
            },
            securityCode: {
              id: "mp-securityCode",
              placeholder: dict.securityCodePlaceholder,
            },
            cardholderName: {
              id: "mp-cardholderName",
              placeholder: dict.cardholderNamePlaceholder,
            },
            issuer: { id: "mp-issuer" },
            installments: { id: "mp-installments" },
            identificationType: { id: "mp-identificationType" },
            identificationNumber: {
              id: "mp-identificationNumber",
              placeholder: dict.identificationNumberPlaceholder,
            },
          },
          callbacks: {
            onFormMounted: (err: unknown) => {
              if (err) {
                console.error("[MP] CardForm mount error:", err);
                return;
              }
              if (mounted) setIsMPReady(true);
            },

            onSubmit: async (event: Event) => {
              event.preventDefault();

              const addressId = selectedAddressIdRef.current;
              if (!addressId) return;

              if (mounted) {
                setIsProcessing(true);
                setError(null);
              }

              const {
                token,
                installments,
                selectedPaymentMethodId,
                issuerId,
                identificationType,
                identificationNumber,
              } = cardFormRef.current!.getCardFormData();

              try {
                const res = await fetch("/api/payments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    token,
                    installments,
                    paymentMethodId: selectedPaymentMethodId,
                    issuerId,
                    addressId,
                    identificationType,
                    identificationNumber,
                  }),
                });

                const data = await res.json();

                if (res.ok) {
                  router.push(
                    `/${lang}/cart/checkout/result?orderId=${data.orderId}&status=success`,
                  );
                } else {
                  if (mounted) {
                    setError(data.error ?? dict.paymentError);
                    setIsProcessing(false);
                  }
                }
              } catch {
                if (mounted) {
                  setError(dict.connectionError);
                  setIsProcessing(false);
                }
              }
            },

            onFetching: (resource: string) => {
              // MP.js fires this while loading installments / payment methods.
              // You could show a per-field loading indicator here if needed.
              console.debug("[MP] Fetching resource:", resource);
            },
          },
        });

        cardFormRef.current = cardForm;
      } catch (err) {
        console.error("[MP] Failed to initialise CardForm:", err);
      }
    };

    initCardForm();

    return () => {
      mounted = false;
      cardFormRef.current?.unmount();
      cardFormRef.current = null;
    };
    // Re-run when public key, subtotal, or lang changes (locale affects MP UI).
    // NOT on address change — that is handled via selectedAddressIdRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mpPublicKey, cart.subtotal, lang]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.layout}>
      {/* ── Left column: address + card form ── */}
      <div className={styles.leftColumn}>
        {/* Step 1 — Address */}
        <section className={styles.section}>
          <h2 className={styles.stepTitle}>{dict.addressStep}</h2>

          {!showAddressPicker ? (
            <Frame className={styles.selectedAddressBox}>
              <div className={styles.selectedAddressRow}>
                <p className={styles.addressText}>
                  <AddressLine address={selectedAddress!} />
                </p>
                <button
                  type="button"
                  className={`${styles.changeBtn} ${Cursor.Pointer}`}
                  onClick={() => setShowAddressPicker(true)}
                >
                  {dict.changeAddress}
                </button>
              </div>
            </Frame>
          ) : (
            <div className={styles.addressPicker}>
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`${styles.addressOption} ${
                    addr.id === selectedAddressId
                      ? styles.addressOptionSelected
                      : ""
                  } ${Cursor.Pointer}`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={addr.id === selectedAddressId}
                    onChange={() => handleAddressSelect(addr.id)}
                    className={styles.radioInput}
                  />
                  <span className={styles.addressOptionText}>
                    <AddressLine address={addr} />
                    {addr.isDefault && (
                      <span className={styles.defaultBadge}>★ default</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* Step 2 — Card form */}
        <section className={styles.section}>
          <h2 className={styles.stepTitle}>{dict.paymentStep}</h2>

          {!isMPReady && <p className={styles.loadingMP}>{dict.loadingMP}</p>}

          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* The form element is always rendered so MP.js can mount its
              listeners even while isMPReady is false. Hidden via CSS until
              the CardForm signals it is ready. */}
          <form
            id="checkout-card-form"
            className={`${styles.cardForm} ${!isMPReady ? styles.cardFormHidden : ""}`}
          >
            <div className={styles.formGrid}>
              {/* Card number */}
              <div className={`${styles.formGroup} ${styles.colFull}`}>
                <label className={styles.label}>{dict.cardNumber}</label>
                <input
                  id="mp-cardNumber"
                  type="text"
                  className={`${styles.input} ${Cursor.Text}`}
                  placeholder={dict.cardNumberPlaceholder}
                />
              </div>

              {/* Expiry + CVV */}
              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.expirationDate}</label>
                <input
                  id="mp-expirationDate"
                  type="text"
                  className={`${styles.input} ${Cursor.Text}`}
                  placeholder={dict.expirationDatePlaceholder}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.securityCode}</label>
                <input
                  id="mp-securityCode"
                  type="text"
                  className={`${styles.input} ${Cursor.Text}`}
                  placeholder={dict.securityCodePlaceholder}
                />
              </div>

              {/* Cardholder name */}
              <div className={`${styles.formGroup} ${styles.colFull}`}>
                <label className={styles.label}>{dict.cardholderName}</label>
                <input
                  id="mp-cardholderName"
                  type="text"
                  className={`${styles.input} ${Cursor.Text}`}
                  placeholder={dict.cardholderNamePlaceholder}
                />
              </div>

              {/* Issuer — populated by MP.js */}
              <div className={`${styles.formGroup} ${styles.colFull}`}>
                <label className={styles.label}>{dict.issuer}</label>
                <select id="mp-issuer" className={styles.select} />
              </div>

              {/* Installments — populated by MP.js after card number */}
              <div className={`${styles.formGroup} ${styles.colFull}`}>
                <label className={styles.label}>{dict.installments}</label>
                <select id="mp-installments" className={styles.select} />
              </div>

              {/* ID type + number */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {dict.identificationType}
                </label>
                <select id="mp-identificationType" className={styles.select} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {dict.identificationNumber}
                </label>
                <input
                  id="mp-identificationNumber"
                  type="text"
                  className={`${styles.input} ${Cursor.Text}`}
                  placeholder={dict.identificationNumberPlaceholder}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing || !selectedAddressId}
              className={`${styles.payBtn} ${Cursor.Pointer}`}
            >
              {isProcessing ? dict.processing : dict.pay}
            </button>
          </form>
        </section>
      </div>

      {/* ── Right column: order summary ── */}
      <aside className={styles.rightColumn}>
        <Frame className={styles.summaryFrame}>
          <h2 className={styles.summaryTitle}>{dict.orderSummary}</h2>

          <p className={styles.itemCount}>
            {dict.items.replace("{count}", String(cart.itemCount))}
          </p>

          <div className={styles.itemList}>
            {cart.items.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <span className={styles.itemName}>
                  {item.product.name}
                  <span className={styles.itemQty}> ×{item.quantity}</span>
                </span>
                <span className={styles.itemPrice}>
                  {formatPrice(
                    (parseFloat(item.product.price) * item.quantity).toFixed(2),
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.summaryRow}>
            <span>{dict.subtotal}</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>{dict.shipping}</span>
            <span className={styles.freeShipping}>{dict.shippingFree}</span>
          </div>

          <div className={styles.divider} />

          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>{dict.total}</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
        </Frame>
      </aside>
    </div>
  );
}

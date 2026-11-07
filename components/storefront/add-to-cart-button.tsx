"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import {
  getProductVariantLabel,
  type ProductVariant,
} from "@/lib/product-variants";

export function AddToCartButton({
  productId,
  variants,
  fulfillmentMode,
  productionLeadTimeDays,
}: {
  productId: string;
  variants: ProductVariant[];
  fulfillmentMode: string;
  productionLeadTimeDays: number | null;
}) {
  const { addItem, hydrated, accountSyncing, items } = useCart();
  const [message, setMessage] = useState("");
  const [selectedVariantKey, setSelectedVariantKey] = useState(
    variants[0]?.key ?? "",
  );
  const [customRequest, setCustomRequest] = useState("");
  const selectedVariant = variants.find(
    (variant) => variant.key === selectedVariantKey,
  );
  const currentQuantity =
    items.find(
      (item) =>
        item.productId === productId && item.variantKey === selectedVariantKey,
    )?.quantity ?? 0;
  const availableQuantity =
    fulfillmentMode === "MADE_TO_ORDER"
      ? 999
      : (selectedVariant?.quantity ?? 0);
  const remainingQuantity = Math.max(0, availableQuantity - currentQuantity);
  const addableQuantity = Math.min(remainingQuantity, 999 - currentQuantity);
  const [quantity, setQuantity] = useState(1);
  const selectedQuantity = Math.min(quantity, Math.max(addableQuantity, 1));
  const unavailable = addableQuantity < 1;

  function handleAdd() {
    if (!selectedVariant) {
      setMessage("Choose an available option first.");
      return;
    }

    const result = addItem(
      productId,
      selectedVariant.key,
      customRequest.trim(),
      availableQuantity,
      selectedQuantity,
    );

    if (result === "added") {
      setMessage("Added to your cart.");
    } else if (result === "cart-full") {
      setMessage("Your cart has reached its item limit.");
    } else if (result === "limit") {
      setMessage("Your selected quantity exceeds the remaining stock.");
    } else if (result === "unavailable") {
      setMessage("This item is currently sold out.");
    } else {
      setMessage("Your cart could not be saved. Check your browser storage.");
    }
  }

  return (
    <div className="shop-add-to-cart-wrap">
      {variants.length > 0 && (
        <label className="shop-option-field">
          <span>
            {variants.length === 1 &&
            Object.keys(variants[0].options)[0] === "Option"
              ? "Product option"
              : "Size and options"}
          </span>
          <select
            value={selectedVariantKey}
            onChange={(event) => {
              setSelectedVariantKey(event.currentTarget.value);
              setMessage("");
            }}
          >
            {variants.map((variant) => (
              <option
                key={variant.key}
                value={variant.key}
                disabled={
                  fulfillmentMode !== "MADE_TO_ORDER" &&
                  (variant.quantity ?? 0) < 1
                }
              >
                {getProductVariantLabel(variant)}
                {fulfillmentMode !== "MADE_TO_ORDER" &&
                  ` (${variant.quantity} available)`}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="shop-option-field">
        <span>Custom request (optional)</span>
        <textarea
          maxLength={500}
          onChange={(event) => setCustomRequest(event.currentTarget.value)}
          placeholder="Add a measurement or personalization request"
          rows={3}
          value={customRequest}
        />
      </label>
      <div className="shop-add-quantity">
        <span className="shop-add-quantity-label">Quantity</span>
        <div className="shop-cart-quantity">
          <button
            type="button"
            aria-label="Decrease quantity to add"
            disabled={
              !hydrated || accountSyncing || unavailable || selectedQuantity <= 1
            }
            onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}
          >
            <Minus aria-hidden="true" />
          </button>
          <span aria-live="polite">{selectedQuantity}</span>
          <button
            type="button"
            aria-label="Increase quantity to add"
            disabled={
              !hydrated ||
              accountSyncing ||
              unavailable ||
              selectedQuantity >= addableQuantity
            }
            onClick={() =>
              setQuantity(Math.min(addableQuantity, selectedQuantity + 1))
            }
          >
            <Plus aria-hidden="true" />
          </button>
        </div>
        <span>
          {unavailable
            ? "No more stock available"
            : `${addableQuantity} available`}
        </span>
      </div>
      <button
        className="shop-button shop-button-dark shop-add-to-cart"
        type="button"
        onClick={handleAdd}
        disabled={
          !hydrated ||
          accountSyncing ||
          unavailable ||
          !selectedVariant
        }
      >
        <ShoppingBag aria-hidden="true" />
        {!selectedVariant
          ? "Options unavailable"
          : availableQuantity < 1
          ? "Sold out"
          : unavailable
            ? "Stock limit reached"
            : "Add to cart"}
      </button>
      <p aria-live="polite" className="shop-cart-feedback">
        {message ||
          (accountSyncing
            ? "Updating your saved cart…"
            : fulfillmentMode === "MADE_TO_ORDER" && productionLeadTimeDays
              ? `Estimated production time: ${productionLeadTimeDays} days.`
              : "")}
      </p>
    </div>
  );
}

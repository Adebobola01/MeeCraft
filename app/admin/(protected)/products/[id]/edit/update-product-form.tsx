"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  updateProduct,
  type UpdateProductState,
} from "../../actions";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES_BY_CATEGORY,
  isProductCategory,
  type ProductCategory,
} from "@/lib/product-catalog";

type EditableProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  productType: string;
  fulfillmentMode: string;
  productionLeadTimeDays: number | null;
  variantsInput: string;
  price: string;
  currencyCode: string;
  status: string;
  images: Array<{
    id: string;
    deliveryUrl: string;
    altText: string;
  }>;
};

export function UpdateProductForm({ product }: { product: EditableProduct }) {
  const initialState: UpdateProductState = {
    name: product.name,
    category: product.category,
    productType: product.productType,
    description: product.description,
    fulfillmentMode: product.fulfillmentMode,
    productionLeadTimeDays:
      product.productionLeadTimeDays === null
        ? ""
        : String(product.productionLeadTimeDays),
    variantsInput: product.variantsInput,
    price: product.price,
    currencyCode: product.currencyCode,
    status: product.status,
  };
  const [state, formAction, isPending] = useActionState(
    updateProduct,
    initialState,
  );
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [productType, setProductType] = useState(product.productType);
  const [fulfillmentMode, setFulfillmentMode] = useState(
    product.fulfillmentMode,
  );

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input name="id" type="hidden" value={product.id} />

      {product.images.length > 0 && (
        <section className="border border-neutral-200 bg-white p-5 sm:p-7">
          <h2 className="text-base font-medium">Product images</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Images attached to this product remain unchanged when you save
            details.
          </p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {product.images.map((image) => (
              <li key={image.id}>
                <div
                  aria-label={image.altText || product.name}
                  className="h-24 w-24 bg-neutral-100 bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url("${image.deliveryUrl}")` }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border border-neutral-200 bg-white p-5 sm:p-7">
        <h2 className="text-base font-medium">Product details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium" htmlFor="name">
              Product name
            </label>
            <input
              className="h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              defaultValue={state.name}
              id="name"
              maxLength={100}
              minLength={2}
              name="name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="category">
              Category
            </label>
            <select
              className="h-11 w-full border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              value={category}
              id="category"
              name="category"
              required
              onChange={(event) => {
                const nextCategory = event.currentTarget.value;
                if (!isProductCategory(nextCategory)) return;
                setCategory(nextCategory);
                setProductType(PRODUCT_TYPES_BY_CATEGORY[nextCategory][0]);
              }}
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="productType"
            >
              Product style
            </label>
            <select
              className="h-11 w-full border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              value={productType}
              id="productType"
              name="productType"
              required
              onChange={(event) => setProductType(event.currentTarget.value)}
            >
              {PRODUCT_TYPES_BY_CATEGORY[category].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="status">
              Listing status
            </label>
            <select
              className="h-11 w-full border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              defaultValue={state.status}
              id="status"
              name="status"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SOLD_OUT">Sold out</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className="min-h-32 w-full resize-y border border-neutral-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-black focus:ring-1 focus:ring-black"
              defaultValue={state.description}
              id="description"
              maxLength={3000}
              name="description"
              rows={5}
            />
          </div>
        </div>
      </section>

      <section className="border border-neutral-200 bg-white p-5 sm:p-7">
        <h2 className="text-base font-medium">Price</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="price">
              Price
            </label>
            <input
              className="h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              defaultValue={state.price}
              id="price"
              inputMode="decimal"
              max="9999999.99"
              min="0.01"
              name="price"
              required
              step="0.01"
              type="number"
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="currencyCode"
            >
              Currency
            </label>
            <select
              className="h-11 w-full border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              defaultValue={state.currencyCode}
              id="currencyCode"
              name="currencyCode"
            >
              <option value="NGN">NGN — Nigerian Naira</option>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
        </div>
      </section>

      <section className="border border-neutral-200 bg-white p-5 sm:p-7">
        <h2 className="text-base font-medium">Availability and options</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Ready-to-ship quantities are tracked for each option combination.
          Made-to-order listings show the production time instead.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="fulfillmentMode"
            >
              Fulfillment
            </label>
            <select
              className="h-11 w-full border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              value={fulfillmentMode}
              id="fulfillmentMode"
              name="fulfillmentMode"
              onChange={(event) =>
                setFulfillmentMode(event.currentTarget.value)
              }
            >
              <option value="READY_TO_SHIP">Ready to ship</option>
              <option value="MADE_TO_ORDER">Made to order</option>
            </select>
          </div>
          {fulfillmentMode === "MADE_TO_ORDER" && (
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                htmlFor="productionLeadTimeDays"
              >
                Production lead time (days)
              </label>
              <input
                className="h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                defaultValue={state.productionLeadTimeDays ?? ""}
                id="productionLeadTimeDays"
                max="365"
                min="1"
                name="productionLeadTimeDays"
                required
                type="number"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="variantsInput"
            >
              Sizes and option combinations
            </label>
            <textarea
              className="min-h-32 w-full resize-y border border-neutral-300 px-3 py-2.5 font-mono text-sm leading-6 outline-none focus:border-black focus:ring-1 focus:ring-black"
              defaultValue={state.variantsInput}
              id="variantsInput"
              maxLength={20000}
              name="variantsInput"
              placeholder={
                category === "Shoes"
                  ? "EU size=38 | 2\nEU size=39 | 1"
                  : "Color=Black; Material=Canvas; Dimensions=Medium; Strap=Long | 2"
              }
              rows={5}
            />
            <p className="mt-1.5 text-xs leading-5 text-neutral-500">
              Ready to ship: end each line with stock, such as{" "}
              <code>EU size=38 | 2</code>. Made to order: end with{" "}
              <code>*</code>, such as <code>EU size=38 | *</code>. Separate
              multiple options with semicolons.
            </p>
          </div>
        </div>
      </section>

      {state.error && (
        <p
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse justify-end gap-3 pb-8 sm:flex-row">
        <Link
          className="flex h-11 items-center justify-center border border-neutral-300 bg-white px-5 text-sm font-medium transition hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          href="/admin"
        >
          Cancel
        </Link>
        <button
          className="h-11 bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-neutral-500"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

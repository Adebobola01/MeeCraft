import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { StoreHeader } from "@/components/storefront/store-header";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductImageGallery } from "@/components/storefront/product-image-gallery";
import { getStorefrontProduct } from "@/data/storefront-products";
import Footer from "@/components/Footer";
import { parseStoredProductVariants } from "@/lib/product-variants";

function formatPrice(priceInMinorUnits: number, currencyCode: string) {
  return new Intl.NumberFormat(currencyCode === "NGN" ? "en-NG" : "en", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(priceInMinorUnits / 100);
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);

  if (!product) notFound();
  const variants = parseStoredProductVariants(product.variantsJson);

  return (
    <div className="storefront">
      <StoreHeader />
      <main className="shop-product-detail shop-content">
        <nav className="shop-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>
        <div className="shop-product-detail-grid">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
            category={product.category}
          />
          <aside className="shop-product-info-panel">
            <p className="shop-kicker">
              {product.category} · {product.productType}
            </p>
            <h1>{product.name}</h1>
            <p className="shop-detail-price">
              {formatPrice(product.priceInMinorUnits, product.currencyCode)}
            </p>
            <div className="shop-detail-divider" />
            <p className="shop-detail-description">
              {product.description ||
                "Choose the size or options that suit you. Add a custom request if you need to share a special detail."}
            </p>
            <p className="shop-detail-stock">
              <span
                className={
                  product.fulfillmentMode === "MADE_TO_ORDER" ||
                  product.quantity > 0
                    ? "shop-stock-dot"
                    : "shop-stock-dot is-sold"
                }
              />
              {product.fulfillmentMode === "MADE_TO_ORDER"
                ? `Made to order · ${product.productionLeadTimeDays} day production time`
                : product.quantity > 0
                  ? "Ready to ship"
                  : "Currently unavailable"}
            </p>
            <AddToCartButton
              productId={product.id}
              variants={variants}
              fulfillmentMode={product.fulfillmentMode}
              productionLeadTimeDays={product.productionLeadTimeDays}
            />
            <div className="shop-detail-notice">
              <p>Looking for something special?</p>
              <Link href="/products">
                Explore more MeeCraft <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
        <div className="shop-back-link">
          <Link href="/products">
            <ArrowLeft aria-hidden="true" /> Back to all products
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

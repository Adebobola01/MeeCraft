import Link from "next/link";
import { ArrowRight, ArrowUpRight, Footprints, ShoppingBag } from "lucide-react";
import { StoreHeader } from "@/components/storefront/store-header";
import Footer from "@/components/Footer";

const giftCategories = [
  {
    name: "Shoes",
    description: "A thoughtful pick for their everyday.",
    icon: Footprints,
  },
  {
    name: "Bags",
    description: "A useful favorite in a style they will love.",
    icon: ShoppingBag,
  },
];

export default function GiftsPage() {
  return (
    <div className="storefront shop-gifts-page">
      <StoreHeader />
      <main className="shop-content shop-gifts-main">
        <nav className="shop-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Gift guide</span>
        </nav>
        <section className="shop-gifts-intro">
          <p className="shop-kicker">THE MECRAFT GIFT GUIDE</p>
          <h1>Find something that feels like them.</h1>
          <p>
            Explore shoes and bags for birthdays, celebrations, and the
            everyday moments worth marking.
          </p>
          <Link href="/products" className="shop-button shop-button-dark">
            Browse all products <ArrowRight aria-hidden="true" />
          </Link>
        </section>
        <section className="shop-gift-categories" aria-labelledby="gift-picks">
          <div className="shop-section-heading">
            <div>
              <p className="shop-kicker">A PLACE TO START</p>
              <h2 id="gift-picks">Explore the collections</h2>
            </div>
          </div>
          <div className="shop-category-grid shop-gift-category-grid">
            {giftCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  className="shop-category-card"
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  key={category.name}
                >
                  <span className="shop-category-image shop-placeholder-art">
                    <Icon aria-hidden="true" />
                    <span>Product photos coming soon</span>
                    <span className="shop-category-arrow">
                      <ArrowUpRight aria-hidden="true" />
                    </span>
                  </span>
                  <span className="shop-category-name">{category.name}</span>
                  <span className="shop-category-subtitle">
                    {category.description}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

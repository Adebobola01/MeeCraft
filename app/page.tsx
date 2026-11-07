import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Footprints,
  ShoppingBag,
} from "lucide-react";
import { ProductTile } from "@/components/storefront/product-tile";
import { Reveal } from "@/components/storefront/reveal";
import { StoreHeader } from "@/components/storefront/store-header";
import {
  getBestSellerProducts,
  getFeaturedProducts,
} from "@/data/storefront-products";
import Footer from "@/components/Footer";

const categories = [
  {
    name: "Shoes",
    description: "Sandals, flats, and heels",
    icon: Footprints,
  },
  {
    name: "Bags",
    description: "Totes, crossbody bags, and clutches",
    icon: ShoppingBag,
  },
];

export default async function Home() {
  const [featured, bestSellers] = await Promise.all([
    getFeaturedProducts(),
    getBestSellerProducts(),
  ]);

  return (
    <div className="storefront">
      <StoreHeader />
      <main>
        <section className="shop-hero">
          <div className="shop-hero-art" aria-hidden="true">
            <div className="shop-hero-art-item shop-hero-art-shoe">
              <Footprints />
              <span>Shoes</span>
            </div>
            <div className="shop-hero-art-item shop-hero-art-bag">
              <ShoppingBag />
              <span>Bags</span>
            </div>
            <span className="shop-hero-art-note">MeeCrafts collection</span>
          </div>
          <div className="shop-hero-shade" />
          <div className="shop-hero-copy">
            <p className="shop-kicker">MEET MEECRAFTS</p>
            <h1>
              Made for
              <br />
              the way you <em>move.</em>
            </h1>
            <p>
              Find shoes and bags for your everyday plans, with options to make
              each choice feel like yours.
            </p>
            <Link href="/products" className="shop-button shop-button-light">
              Explore the collection <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <span className="shop-hero-caption">
            PRODUCT PHOTOGRAPHY COMING SOON
          </span>
        </section>

        <section className="shop-category-section shop-content">
          <div className="shop-section-heading">
            <div>
              <p className="shop-kicker">FIND YOUR NEXT FAVORITE</p>
              <h2>Shop by category</h2>
            </div>
            <Link className="shop-text-link" href="/products">
              View all products <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="shop-category-scrollable shop-category-scrollable-two">
            {categories.map((category) => {
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

        <section className="shop-featured-section">
          <div className="shop-content">
            <div className="shop-section-heading">
              <div>
                <p className="shop-kicker">FRESH FROM MEECRAFTS</p>
                <h2>Just added</h2>
              </div>
              <Link className="shop-text-link" href="/products?sort=newest">
                Shop new arrivals <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
            {featured.length ? (
              <div className="shop-product-grid">
                {featured.map((product, index) => (
                  <Reveal key={product.id} delay={index * 0.04}>
                    <ProductTile product={product} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="shop-empty-products">
                <span className="shop-empty-mark" aria-hidden="true">
                  M
                </span>
                <div>
                  <h3>The first MeeCrafts pieces are on their way.</h3>
                  <p>
                    Check back soon, or browse shoes and bags to see what is
                    coming.
                  </p>
                </div>
                <Link href="/products" className="shop-button shop-button-dark">
                  Browse products <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="shop-best-sellers-section">
          <div className="shop-content">
            <div className="shop-section-heading">
              <div>
                <p className="shop-kicker">THE MEECRAFTS EDIT</p>
                <h2>Popular picks</h2>
              </div>
              <Link className="shop-text-link" href="/products">
                Shop all products <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
            {bestSellers.length ? (
              <div className="shop-product-grid">
                {bestSellers.map((product, index) => (
                  <Reveal key={product.id} delay={index * 0.04}>
                    <ProductTile product={product} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="shop-empty-products">
                <span className="shop-empty-mark" aria-hidden="true">
                  M
                </span>
                <div>
                  <h3>Popular picks will appear here.</h3>
                  <p>
                    In the meantime, explore the upcoming shoes and bags
                    collection.
                  </p>
                </div>
                <Link href="/products" className="shop-button shop-button-dark">
                  Browse products <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="shop-story shop-content">
          <div className="shop-story-image shop-story-placeholder">
            <Footprints aria-hidden="true" />
            <ShoppingBag aria-hidden="true" />
            <span>More about MeeCrafts</span>
          </div>
          <div className="shop-story-copy">
            <p className="shop-kicker">A NEW WAY TO SHOP</p>
            <h2>
              Your style,
              <br />
              your everyday.
            </h2>
            <p>
              Browse shoes and bags, compare the available options, and choose
              the details that work for you.
            </p>
            <Link href="/products" className="shop-text-link">
              Find your fit <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

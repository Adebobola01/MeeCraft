import Link from "next/link";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { ProductTile } from "@/components/storefront/product-tile";
import { StoreHeader } from "@/components/storefront/store-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStorefrontProducts } from "@/data/storefront-products";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES_BY_CATEGORY,
  isProductCategory,
  isProductType,
} from "@/lib/product-catalog";
import Footer from "@/components/Footer";

type SearchParams = Promise<{
  q?: string | string[];
  category?: string | string[];
  type?: string | string[];
  sort?: string | string[];
  page?: string | string[];
}>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function pageUrl(
  page: number,
  search: string,
  category: string,
  productType: string,
  sort: string,
) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (category) params.set("category", category);
  if (productType) params.set("type", productType);
  if (sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/products${query ? `?${query}` : ""}`;
}

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await (searchParams as SearchParams);
  const rawSearch = firstValue(params.q).trim();
  const search = rawSearch.slice(0, 100);
  const selectedCategory = firstValue(params.category);
  const category = isProductCategory(selectedCategory) ? selectedCategory : "";
  const requestedType = firstValue(params.type);
  const productType = isProductType(category, requestedType) ? requestedType : "";
  const requestedSort = firstValue(params.sort);
  const sort = ["price-low", "price-high"].includes(requestedSort)
    ? requestedSort
    : "newest";
  const parsedPage = Number.parseInt(firstValue(params.page), 10);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, 100_000)
      : 1;
  const result = await getStorefrontProducts({
    search,
    category,
    productType,
    sort,
    page,
  });
  const currentPage = Math.min(page, result.pageCount);
  const products =
    currentPage === page
      ? result.products
      : (
          await getStorefrontProducts({
            search,
            category,
            productType,
            sort,
            page: currentPage,
          })
        ).products;

  return (
    <div className="storefront">
      <StoreHeader />
      <main className="shop-catalog shop-content">
        <nav className="shop-breadcrumbs" aria-label="Breadcrumb ">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Shop</span>
        </nav>
        <div className="shop-catalog-heading">
          <div>
            <p className="shop-kicker">MECRAFT COLLECTION</p>
            <h1>{productType || category || "Shoes & bags"}</h1>
          </div>
          <p>
            Explore shoes and bags, compare the available options, and choose
            what suits you.
          </p>
        </div>
        <nav className="shop-category-nav" aria-label="Product categories">
          <Link href="/products" aria-current={!category ? "page" : undefined}>
            All products
          </Link>
          {PRODUCT_CATEGORIES.map((item) => (
            <Link
              href={`/products?category=${encodeURIComponent(item)}`}
              aria-current={category === item ? "page" : undefined}
              key={item}
            >
              {item}
            </Link>
          ))}
        </nav>
        <form className="shop-filter-bar" action="/products">
          <label className="shop-search-field">
            <Search aria-hidden="true" />
            <Input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search shoes and bags"
              aria-label="Search products"
            />
          </label>
          <label className="shop-filter-select">
            <span className="sr-only">Product style</span>
            <select name="type" defaultValue={productType}>
              <option value="">All styles</option>
              {(category
                ? PRODUCT_TYPES_BY_CATEGORY[category]
                : PRODUCT_CATEGORIES.flatMap(
                    (item) => PRODUCT_TYPES_BY_CATEGORY[item],
                  )
              ).map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="shop-filter-select">
            <span className="sr-only">Category</span>
            <select name="category" defaultValue={category}>
              <option value="">All categories</option>
              {PRODUCT_CATEGORIES.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="shop-filter-select">
            <span className="sr-only">Sort products</span>
            <select name="sort" defaultValue={sort}>
              <option value="newest">Newest arrivals</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
          <Button type="submit" size="lg" className="shop-filter-submit">
            Apply filters
          </Button>
        </form>
        <div className="shop-results">
          <span>
            {result.total} {result.total === 1 ? "product" : "products"} to discover
          </span>
          {(search || category || productType) && (
            <Link href="/products" className="shop-clear-filters">
              Clear filters
            </Link>
          )}
        </div>
        {products.length ? (
          <div className="shop-product-grid">
            {products.map((product, index) => (
              <ProductTile
                key={product.id}
                product={product}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="shop-catalog-empty">
            <span className="shop-kicker">MECRAFT COLLECTION</span>
            <h2>
              {search || category || productType
                ? "No products found"
                : "New products are on the way"}
            </h2>
            <p>
              {search || category || productType
                ? "Try another search or clear the filters to browse all shoes and bags."
                : "The MeeCraft collection is being prepared. Check back soon to see what is available."}
            </p>
            {(search || category || productType) && (
              <Button
                nativeButton={false}
                render={<Link href="/products" />}
                variant="outline"
                size="lg"
                className="shop-filter-submit"
              >
                <ArrowLeft aria-hidden="true" /> Shop all products
              </Button>
            )}
          </div>
        )}
        {result.pageCount > 1 && (
          <nav className="shop-pagination" aria-label="Product pages">
            {currentPage > 1 ? (
              <Link
                href={pageUrl(
                  currentPage - 1,
                  search,
                  category,
                  productType,
                  sort,
                )}
              >
                <ArrowLeft aria-hidden="true" /> Previous
              </Link>
            ) : (
              <span />
            )}
            <span>
              {currentPage} / {result.pageCount}
            </span>
            {currentPage < result.pageCount ? (
              <Link
                href={pageUrl(
                  currentPage + 1,
                  search,
                  category,
                  productType,
                  sort,
                )}
              >
                Next <ArrowRight aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}

import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  isProductCategory,
  isProductType,
  PRODUCT_CATEGORIES,
} from "@/lib/product-catalog";

const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  category: true,
  productType: true,
  fulfillmentMode: true,
  productionLeadTimeDays: true,
  variantsJson: true,
  priceInMinorUnits: true,
  currencyCode: true,
  quantity: true,
  images: {
    orderBy: { displayOrder: "asc" },
    take: 1,
    select: { deliveryUrl: true, altText: true },
  },
} satisfies Prisma.ProductSelect;

export type StorefrontProduct = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

export const BEST_SELLER_PRODUCT_SLUGS: string[] = [];

export async function getFeaturedProducts() {
  return db.product.findMany({
    where: {
      status: "PUBLISHED",
      category: { in: [...PRODUCT_CATEGORIES] },
    },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: 4,
    select: productCardSelect,
  });
}

export async function getBestSellerProducts() {
  if (BEST_SELLER_PRODUCT_SLUGS.length === 0) {
    return [];
  }

  const products = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      category: { in: [...PRODUCT_CATEGORIES] },
      slug: { in: BEST_SELLER_PRODUCT_SLUGS },
    },
    select: productCardSelect,
  });
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));

  return BEST_SELLER_PRODUCT_SLUGS.flatMap((slug) => {
    const product = productsBySlug.get(slug);
    return product ? [product] : [];
  });
}

export async function getStorefrontProducts({
  search,
  category,
  productType,
  sort,
  page,
}: {
  search: string;
  category: string;
  productType: string;
  sort: string;
  page: number;
}) {
  const conditions: Prisma.ProductWhereInput[] = [
    { status: "PUBLISHED" },
    { category: { in: [...PRODUCT_CATEGORIES] } },
  ];

  if (isProductCategory(category)) {
    conditions.push({ category });
  }
  if (isProductType(category, productType)) {
    conditions.push({ productType });
  }
  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { productType: { contains: search } },
      ],
    });
  }

  const where: Prisma.ProductWhereInput = { AND: conditions };
  const pageSize = 12;
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-low"
      ? { priceInMinorUnits: "asc" }
      : sort === "price-high"
        ? { priceInMinorUnits: "desc" }
        : { createdAt: "desc" };

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: [orderBy, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: productCardSelect,
    }),
  ]);

  return {
    products,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getStorefrontProduct(slug: string) {
  return db.product.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      category: { in: [...PRODUCT_CATEGORIES] },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      productType: true,
      fulfillmentMode: true,
      productionLeadTimeDays: true,
      variantsJson: true,
      priceInMinorUnits: true,
      currencyCode: true,
      quantity: true,
      images: {
        orderBy: { displayOrder: "asc" },
        select: { id: true, deliveryUrl: true, altText: true },
      },
    },
  });
}

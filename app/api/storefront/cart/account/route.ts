import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PRODUCT_CATEGORIES } from "@/lib/product-catalog";
import { getProductVariant, parseStoredProductVariants } from "@/lib/product-variants";
import { headers } from "next/headers";

const MAX_CART_LINES = 50;
const MAX_CART_QUANTITY = 999;

type CartInput = {
  productId: string;
  variantKey: string;
  customRequest: string;
  quantity: number;
}[];

function parseItems(value: unknown): CartInput | null {
  if (!Array.isArray(value) || value.length > MAX_CART_LINES) return null;
  const lines = new Map<string, CartInput[number]>();

  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("productId" in item) ||
      typeof item.productId !== "string" ||
      item.productId.length === 0 ||
      item.productId.length > 100 ||
      !("quantity" in item) ||
      typeof item.quantity !== "number" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_CART_QUANTITY
    ) {
      return null;
    }

    const variantKey =
      "variantKey" in item && typeof item.variantKey === "string"
        ? item.variantKey
        : "{}";
    const customRequest =
      "customRequest" in item && typeof item.customRequest === "string"
        ? item.customRequest
        : "";
    if (
      variantKey.length === 0 ||
      variantKey.length > 1000 ||
      customRequest.length > 500
    ) {
      return null;
    }

    const lineId = `${item.productId}\u0000${variantKey}`;
    const existing = lines.get(lineId);
    lines.set(lineId, {
      productId: item.productId,
      variantKey,
      customRequest,
      quantity: Math.min(
        MAX_CART_QUANTITY,
        (existing?.quantity ?? 0) + item.quantity,
      ),
    });
  }

  return Array.from(lines.values());
}

async function readItems(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || !("items" in body)) {
      return null;
    }
    return parseItems(body.items);
  } catch {
    return null;
  }
}

async function saveCart(
  tx: Prisma.TransactionClient,
  userId: string,
  requestedItems: CartInput,
  mergeExisting: boolean,
) {
  const existingItems = mergeExisting
    ? await tx.customerCartItem.findMany({
        where: { userId },
        select: {
          productId: true,
          variantKey: true,
          customRequest: true,
          quantity: true,
        },
      })
    : [];
  const lines = new Map<string, CartInput[number]>();

  for (const item of existingItems) {
    lines.set(`${item.productId}\u0000${item.variantKey}`, item);
  }
  for (const item of requestedItems) {
    const lineId = `${item.productId}\u0000${item.variantKey}`;
    const existing = lines.get(lineId);
    lines.set(lineId, {
      ...item,
      customRequest: item.customRequest || existing?.customRequest || "",
      quantity: Math.min(
        MAX_CART_QUANTITY,
        (existing?.quantity ?? 0) + item.quantity,
      ),
    });
  }

  const candidateLines = [...lines.values()];
  const productIds = [...new Set(candidateLines.map((item) => item.productId))];
  const products = await tx.product.findMany({
    where: {
      id: { in: productIds },
      status: "PUBLISHED",
      category: { in: [...PRODUCT_CATEGORIES] },
    },
    select: {
      id: true,
      fulfillmentMode: true,
      variantsJson: true,
    },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));
  const items = candidateLines.flatMap((line) => {
    const product = productsById.get(line.productId);
    if (!product) return [];

    const variants = parseStoredProductVariants(product.variantsJson);
    const variant = getProductVariant(variants, line.variantKey);
    if (!variant) return [];

    const availableQuantity =
      product.fulfillmentMode === "MADE_TO_ORDER" && variant.quantity === null
        ? MAX_CART_QUANTITY
        : (variant.quantity ?? 0);
    if (availableQuantity < 1) return [];

    return [
      {
        userId,
        productId: product.id,
        variantKey: line.variantKey,
        customRequest: line.customRequest,
        quantity: Math.min(line.quantity, availableQuantity),
      },
    ];
  });

  await tx.customerCartItem.deleteMany({ where: { userId } });
  if (items.length) {
    await tx.customerCartItem.createMany({ data: items });
  }

  return items.map(({ productId, variantKey, customRequest, quantity }) => ({
    productId,
    variantKey,
    customRequest,
    quantity,
  }));
}

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Sign in to access your saved cart." }, { status: 401 });
  }

  const items = await db.customerCartItem.findMany({
    where: { userId },
    select: {
      productId: true,
      variantKey: true,
      customRequest: true,
      quantity: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ items });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Sign in to sync your cart." }, { status: 401 });
  }

  const items = await readItems(request);
  if (!items) {
    return Response.json({ error: "Invalid cart data." }, { status: 400 });
  }

  const mergedItems = await db.$transaction((tx) =>
    saveCart(tx, userId, items, true),
  );

  return Response.json({ items: mergedItems });
}

export async function PUT(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Sign in to update your saved cart." }, { status: 401 });
  }

  const items = await readItems(request);
  if (!items) {
    return Response.json({ error: "Invalid cart data." }, { status: 400 });
  }

  const updatedItems = await db.$transaction((tx) =>
    saveCart(tx, userId, items, false),
  );

  return Response.json({ items: updatedItems });
}

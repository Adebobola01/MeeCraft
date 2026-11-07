"use server";

import { redirect } from "next/navigation";
import {
  createAdminProduct,
  updateAdminProduct,
} from "@/data/admin-products";
import {
  isFulfillmentMode,
  isProductCategory,
  isProductType,
} from "@/lib/product-catalog";

export type CreateProductState = {
  error?: string;
  name?: string;
  category?: string;
  productType?: string;
  description?: string;
  fulfillmentMode?: string;
  productionLeadTimeDays?: string;
  variantsInput?: string;
  price?: string;
  currencyCode?: string;
  status?: string;
  imageTickets?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateProductValues(values: CreateProductState) {
  const priceMatch = /^(?:\d{1,7})(?:\.\d{1,2})?$/.test(values.price ?? "");
  const parsedPrice = priceMatch ? Number(values.price) : NaN;
  const leadTime = values.productionLeadTimeDays ?? "";
  const parsedLeadTime = /^\d{1,3}$/.test(leadTime) ? Number(leadTime) : null;

  if ((values.name ?? "").length < 2 || (values.name ?? "").length > 100) {
    return { error: "Name must be between 2 and 100 characters." };
  }
  if (!isProductCategory(values.category ?? "")) {
    return { error: "Choose a product category from the list." };
  }
  if (!isProductType(values.category ?? "", values.productType ?? "")) {
    return { error: "Choose a product type that matches the category." };
  }
  if ((values.description ?? "").length > 3000) {
    return { error: "Description must be 3,000 characters or less." };
  }
  if (!isFulfillmentMode(values.fulfillmentMode ?? "")) {
    return { error: "Choose a fulfillment method." };
  }
  if (
    values.fulfillmentMode === "MADE_TO_ORDER" &&
    (parsedLeadTime === null || parsedLeadTime < 1 || parsedLeadTime > 365)
  ) {
    return {
      error: "Set a production lead time between 1 and 365 days.",
    };
  }
  if (
    values.fulfillmentMode === "READY_TO_SHIP" &&
    values.productionLeadTimeDays
  ) {
    return { error: "Ready-to-ship products do not use a production lead time." };
  }
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return {
      error: "Enter a price greater than zero with up to two decimal places.",
    };
  }
  if (!["NGN", "USD", "GBP", "EUR"].includes(values.currencyCode ?? "")) {
    return { error: "Choose a supported currency." };
  }

  return {
    parsedPrice,
    parsedLeadTime:
      values.fulfillmentMode === "MADE_TO_ORDER" ? parsedLeadTime : null,
  };
}

function parseImageTickets(value: string) {
  let imageTickets: unknown;
  try {
    imageTickets = JSON.parse(value || "[]");
  } catch {
    return { error: "Image details are invalid. Please retry." };
  }

  if (!Array.isArray(imageTickets) || imageTickets.length > 6) {
    return { error: "Add no more than six product images." };
  }
  return { imageTickets };
}

export async function createProduct(
  _previousState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  const values: CreateProductState = {
    name: getString(formData, "name"),
    category: getString(formData, "category"),
    productType: getString(formData, "productType"),
    description: getString(formData, "description"),
    fulfillmentMode: getString(formData, "fulfillmentMode"),
    productionLeadTimeDays: getString(formData, "productionLeadTimeDays"),
    variantsInput: getString(formData, "variantsInput"),
    price: getString(formData, "price"),
    currencyCode: getString(formData, "currencyCode"),
    status: getString(formData, "status"),
    imageTickets: getString(formData, "imageTickets"),
  };
  const validation = validateProductValues(values);
  if ("error" in validation) return { ...values, error: validation.error };

  if (!["DRAFT", "PUBLISHED"].includes(values.status ?? "")) {
    return { ...values, error: "Choose draft or published status." };
  }

  const imageResult = parseImageTickets(values.imageTickets ?? "[]");
  if ("error" in imageResult) return { ...values, error: imageResult.error };
  if (values.status === "PUBLISHED" && imageResult.imageTickets.length === 0) {
    return {
      ...values,
      error: "Add at least one product image before publishing.",
    };
  }

  try {
    await createAdminProduct({
      name: values.name ?? "",
      category: values.category ?? "",
      productType: values.productType ?? "",
      description: values.description ?? "",
      fulfillmentMode: values.fulfillmentMode ?? "",
      productionLeadTimeDays: validation.parsedLeadTime,
      variantsInput: values.variantsInput ?? "",
      priceInMinorUnits: Math.round(validation.parsedPrice * 100),
      currencyCode: values.currencyCode ?? "",
      status: values.status ?? "",
      imageTickets: imageResult.imageTickets,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/admin/login");
    }
    if (error instanceof Error && error.message.startsWith("PRODUCT_FORM:")) {
      return { ...values, error: error.message.slice("PRODUCT_FORM:".length) };
    }
    console.error("Failed to create an admin product.", error);
    return {
      ...values,
      error: "The product could not be saved. Please try again.",
    };
  }

  redirect("/admin?created=1");
}

export type UpdateProductState = CreateProductState;

export async function updateProduct(
  _previousState: UpdateProductState,
  formData: FormData,
): Promise<UpdateProductState> {
  const values: UpdateProductState & { id: string } = {
    id: getString(formData, "id"),
    name: getString(formData, "name"),
    category: getString(formData, "category"),
    productType: getString(formData, "productType"),
    description: getString(formData, "description"),
    fulfillmentMode: getString(formData, "fulfillmentMode"),
    productionLeadTimeDays: getString(formData, "productionLeadTimeDays"),
    variantsInput: getString(formData, "variantsInput"),
    price: getString(formData, "price"),
    currencyCode: getString(formData, "currencyCode"),
    status: getString(formData, "status"),
  };

  if (!values.id) {
    return { ...values, error: "This product could not be found." };
  }

  const validation = validateProductValues(values);
  if ("error" in validation) return { ...values, error: validation.error };
  if (!["DRAFT", "PUBLISHED", "SOLD_OUT"].includes(values.status ?? "")) {
    return { ...values, error: "Choose a valid listing status." };
  }

  try {
    await updateAdminProduct({
      id: values.id,
      name: values.name ?? "",
      category: values.category ?? "",
      productType: values.productType ?? "",
      description: values.description ?? "",
      fulfillmentMode: values.fulfillmentMode ?? "",
      priceInMinorUnits: Math.round(validation.parsedPrice * 100),
      productionLeadTimeDays: validation.parsedLeadTime,
      variantsInput: values.variantsInput ?? "",
      currencyCode: values.currencyCode ?? "",
      status: values.status ?? "",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/admin/login");
    }
    if (error instanceof Error && error.message.startsWith("PRODUCT_FORM:")) {
      return { ...values, error: error.message.slice("PRODUCT_FORM:".length) };
    }
    console.error("Failed to update an admin product.", error);
    return {
      ...values,
      error: "The product could not be updated. Please try again.",
    };
  }

  redirect("/admin?updated=1");
}

export type ProductVariant = {
  key: string;
  options: Record<string, string>;
  quantity: number | null;
};

export type ParsedProductVariants = {
  variants: ProductVariant[];
  quantity: number;
};

function optionKey(options: Record<string, string>) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(options).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  );
}

export function parseProductVariants(
  input: string,
  fulfillmentMode: string,
): ParsedProductVariants {
  if (input.length > 20_000) {
    throw new Error("PRODUCT_FORM:Product options must be 20,000 characters or less.");
  }

  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 200) {
    throw new Error("PRODUCT_FORM:Add no more than 200 product options.");
  }

  const variants: ProductVariant[] = [];
  const keys = new Set<string>();
  let totalQuantity = 0;

  for (const [index, line] of lines.entries()) {
    const separator = line.lastIndexOf("|");
    if (separator < 0) {
      throw new Error(
        `PRODUCT_FORM:Option line ${index + 1} must end with "| quantity" (use * for made to order).`,
      );
    }

    const rawOptions = line.slice(0, separator).trim();
    const rawQuantity = line.slice(separator + 1).trim();
    const options: Record<string, string> = {};
    const optionNames = new Set<string>();

    for (const option of rawOptions.split(";")) {
      const equals = option.indexOf("=");
      if (equals < 1) {
        throw new Error(
          `PRODUCT_FORM:Option line ${index + 1} must use Name=Value pairs separated by semicolons.`,
        );
      }

      const name = option.slice(0, equals).trim();
      const value = option.slice(equals + 1).trim();
      const normalizedName = name.toLowerCase();

      if (
        name.length < 2 ||
        name.length > 40 ||
        value.length < 1 ||
        value.length > 80 ||
        optionNames.has(normalizedName)
      ) {
        throw new Error(
          `PRODUCT_FORM:Option line ${index + 1} has an invalid or repeated option.`,
        );
      }

      optionNames.add(normalizedName);
      options[name] = value;
    }

    if (Object.keys(options).length === 0 || Object.keys(options).length > 6) {
      throw new Error(
        `PRODUCT_FORM:Option line ${index + 1} must include between one and six options.`,
      );
    }

    const key = optionKey(options);
    if (keys.has(key)) {
      throw new Error(
        `PRODUCT_FORM:Option line ${index + 1} repeats an existing option combination.`,
      );
    }
    keys.add(key);

    let quantity: number | null;
    if (fulfillmentMode === "MADE_TO_ORDER") {
      if (rawQuantity !== "*") {
        throw new Error(
          `PRODUCT_FORM:Made-to-order option line ${index + 1} must end with "| *".`,
        );
      }
      quantity = null;
    } else {
      if (!/^\d{1,7}$/.test(rawQuantity)) {
        throw new Error(
          `PRODUCT_FORM:Ready-to-ship option line ${index + 1} must end with a whole-number stock quantity.`,
        );
      }
      quantity = Number(rawQuantity);
      if (!Number.isSafeInteger(quantity) || quantity > 1_000_000) {
        throw new Error(
          `PRODUCT_FORM:Stock on option line ${index + 1} must be between 0 and 1,000,000.`,
        );
      }
      totalQuantity += quantity;
      if (totalQuantity > 1_000_000) {
        throw new Error(
          "PRODUCT_FORM:Combined stock must be 1,000,000 or less.",
        );
      }
    }

    variants.push({ key, options, quantity });
  }

  return { variants, quantity: totalQuantity };
}

export function parseStoredProductVariants(value: string): ProductVariant[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error("Stored product options are invalid.");
  }

  return parsed.flatMap((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("key" in item) ||
      typeof item.key !== "string" ||
      !("options" in item) ||
      typeof item.options !== "object" ||
      item.options === null ||
      Array.isArray(item.options) ||
      !("quantity" in item) ||
      (item.quantity !== null &&
        (typeof item.quantity !== "number" ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity < 0))
    ) {
      throw new Error("Stored product options are invalid.");
    }

    const options: Record<string, string> = {};
    for (const [name, optionValue] of Object.entries(item.options)) {
      if (typeof optionValue !== "string") {
        throw new Error("Stored product options are invalid.");
      }
      options[name] = optionValue;
    }

    if (optionKey(options) !== item.key) {
      throw new Error("Stored product options are invalid.");
    }

    return [{ key: item.key, options, quantity: item.quantity }];
  });
}

export function formatProductVariantsForAdmin(value: string) {
  return parseStoredProductVariants(value)
    .map((variant) => {
      const options = Object.entries(variant.options)
        .map(([name, optionValue]) => `${name}=${optionValue}`)
        .join("; ");
      return `${options} | ${variant.quantity === null ? "*" : variant.quantity}`;
    })
    .join("\n");
}

export function getProductVariantLabel(variant: ProductVariant) {
  return Object.entries(variant.options)
    .map(([name, value]) => `${name}: ${value}`)
    .join(" · ");
}

export function getProductVariant(
  variants: ProductVariant[],
  key: string,
) {
  return variants.find((variant) => variant.key === key);
}

export function getAvailableVariantQuantity(
  variant: ProductVariant | undefined,
  fulfillmentMode: string,
) {
  if (!variant) return 0;
  return fulfillmentMode === "MADE_TO_ORDER" && variant.quantity === null
    ? 999
    : (variant.quantity ?? 0);
}

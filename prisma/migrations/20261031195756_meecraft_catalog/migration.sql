-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomerCartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantKey" TEXT NOT NULL DEFAULT '{}',
    "customRequest" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerCartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomerCartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CustomerCartItem" ("createdAt", "id", "productId", "quantity", "updatedAt", "userId") SELECT "createdAt", "id", "productId", "quantity", "updatedAt", "userId" FROM "CustomerCartItem";
DROP TABLE "CustomerCartItem";
ALTER TABLE "new_CustomerCartItem" RENAME TO "CustomerCartItem";
CREATE INDEX "CustomerCartItem_productId_idx" ON "CustomerCartItem"("productId");
CREATE UNIQUE INDEX "CustomerCartItem_userId_productId_variantKey_key" ON "CustomerCartItem"("userId", "productId", "variantKey");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "productType" TEXT NOT NULL DEFAULT '',
    "fulfillmentMode" TEXT NOT NULL DEFAULT 'READY_TO_SHIP',
    "productionLeadTimeDays" INTEGER,
    "variantsJson" TEXT NOT NULL DEFAULT '[]',
    "priceInMinorUnits" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "currencyCode" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "createdAt", "currencyCode", "description", "id", "name", "priceInMinorUnits", "quantity", "slug", "status", "updatedAt") SELECT "category", "createdAt", "currencyCode", "description", "id", "name", "priceInMinorUnits", "quantity", "slug", "status", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_status_updatedAt_idx" ON "Product"("status", "updatedAt");
CREATE INDEX "Product_category_idx" ON "Product"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

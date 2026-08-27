const DODO_LIVE_HOST = "live.dodopayments.com";
const DODO_TEST_HOST = "test.dodopayments.com";

export function getDodoApiBaseUrl() {
  const host = process.env.NODE_ENV === "production" ? DODO_LIVE_HOST : DODO_TEST_HOST;
  return `https://${host}`;
}

export function getDodoProductId(packageId: string) {
  const productId =
    packageId === "pink-coins-1000"
      ? process.env.DODO_PRODUCT_ID_BIG ?? process.env.product_id_big
      : process.env.DODO_PRODUCT_ID_SMALL ?? process.env.product_id_small;

  if (!productId) {
    throw new Error(
      packageId === "pink-coins-1000"
        ? "DODO_PRODUCT_ID_BIG is not configured"
        : "DODO_PRODUCT_ID_SMALL is not configured",
    );
  }

  return productId;
}

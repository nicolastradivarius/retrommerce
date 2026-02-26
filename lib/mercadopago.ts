import MercadoPagoConfig from "mercadopago";

// This file is used to create a single instance of the MercadoPagoConfig class and export it for use in other parts of the application. It also ensures that the instance is only created once, even in development mode where hot reloading may cause the file to be re-evaluated multiple times.
// In production mode, the instance is created once and stored in the global object. In development mode, the instance is also stored in the global object to prevent multiple instances from being created during hot reloading.
// By using this pattern, we can ensure that we are always using the same instance of the MercadoPagoConfig class throughout the application, which can help prevent issues related to multiple instances and improve performance.
const globalForMP = globalThis as unknown as {
  mercadopago: MercadoPagoConfig | undefined;
};

export const mp =
  globalForMP.mercadopago ??
  new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });

if (process.env.NODE_ENV !== "production") {
  globalForMP.mercadopago = mp;
}

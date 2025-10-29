import { GrowthBook } from "@growthbook/growthbook-react";

export const gb = new GrowthBook({
    apiHost: "https://cdn.growthbook.io",
    clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY,
});
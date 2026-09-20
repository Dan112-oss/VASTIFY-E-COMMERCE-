export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price_cents: number;
  currency: string;
  image_url?: string | null;
  category_name?: string | null;
  badge?: string | null;
};

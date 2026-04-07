import { ListingPage } from "@/components/listing/listing-page";
import { getListingData } from "@/lib/catalog/get-listing-data";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const routeParams = await params;
  const query = await searchParams;

  const data = await getListingData("category", {
    category: routeParams.slug,
    q: typeof query.q === "string" ? query.q : undefined,
    sort: typeof query.sort === "string" ? query.sort : undefined
  });

  return <ListingPage data={data} />;
}

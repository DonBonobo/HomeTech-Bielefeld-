import { ListingPage } from "@/components/listing/listing-page";
import { getListingData } from "@/lib/catalog/get-listing-data";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const data = await getListingData("search", {
    q: typeof params.q === "string" ? params.q : undefined,
    category: typeof params.category === "string" ? params.category : undefined,
    sort: typeof params.sort === "string" ? params.sort : undefined
  });

  return <ListingPage data={data} />;
}

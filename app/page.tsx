import { Homepage } from "@/components/home/homepage";
import { getHomepageData } from "@/lib/catalog/get-homepage-data";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const data = await getHomepageData({
    q: typeof params.q === "string" ? params.q : undefined,
    category: typeof params.category === "string" ? params.category : undefined
  });

  return <Homepage data={data} />;
}

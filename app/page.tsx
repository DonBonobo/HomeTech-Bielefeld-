import { Homepage } from "@/components/home/homepage";
import { getHomepageData } from "@/lib/catalog/get-homepage-data";

export default async function Page() {
  const data = await getHomepageData({});

  return <Homepage data={data} />;
}

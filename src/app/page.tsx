import MasalaApp from "@/components/MasalaApp";
import { getMasalaData } from "./actions";

export default async function Home() {
  const { products, promos, orders } = await getMasalaData();
  
  return <MasalaApp 
    initialProducts={products} 
    initialPromos={promos} 
    initialOrders={orders} 
  />;
}

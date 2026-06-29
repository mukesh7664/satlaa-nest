import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BiMessageAdd } from "react-icons/bi";
import { FiRefreshCcw } from "react-icons/fi";
import Image from "next/image";

type PurchaseItemType = {
    id: number;
    logo: string;
    vendor: string;
    productName: string;
    price: number;
    userCount: number;
    plan: 'Yearly' | 'Monthly' | 'One-time Purchase';
    purchaseDate: string;
  };

export const PurchaseItemCard = ({ item }: { item: PurchaseItemType }) => (
    <Card className="overflow-hidden shadow-lg shadow-blue-100 rounded-md transition-shadow">
    <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
      
      {/* Logo */}
      <div className="flex-shrink-0">
        <Image
          src={item.logo} // Placeholder for the item prop
          alt={`${item.productName} logo`} // Placeholder for the item prop
          width={100}
          height={100}
          className="rounded-lg object-cover"
        />
      </div>
      
      {/* Details */}
      <div className="flex-grow w-full">
        <p className="text-sm text-muted-foreground">{item.vendor}</p>
        <h3 className="text-lg font-medium text-gray-800">{item.productName}</h3>
        <p className="text-lg  font-medium text-gray-900">${item.price.toFixed(2)}</p>
        
        {/* This metadata section will now wrap on small screens */}
        <div className=" gap-x-2 gap-y-1 text-sm text-muted-foreground mt-1">
          <div className="flex items-center flex-wrap">
          <span>User : {item.userCount} | </span>
          <span>Plan : {item.plan}</span>
          </div>
          <span>Date of purchase : {item.purchaseDate}</span>
        </div>
      </div>
      
      {/* Action Buttons: Full-width on mobile, fixed-width on desktop */}
      <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto flex-shrink-0">
        <Button variant="BlueDark" >
          <BiMessageAdd  className="mr-2 h-4 w-4" />
          Submit Your Feedback
        </Button>
        <Button variant="BlueOutline"   >
          <FiRefreshCcw  className="mr-2 h-4 w-4" />
          Renew Subscription
        </Button>
      </div>
      
    </CardContent>
  </Card>
  );
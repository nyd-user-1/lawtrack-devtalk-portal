import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillWithSponsor } from "@/types/bills";

interface BillCardProps {
  bill: BillWithSponsor;
  onClick: (bill: BillWithSponsor) => void;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'passed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const BillCard = ({ bill, onClick }: BillCardProps) => {
  return (
    <Card
      className="bill-card cursor-pointer hover:shadow-lg transition-shadow bg-white"
      onClick={() => onClick(bill)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with title and status */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-2">{bill.bill_number}</h3>
            </div>
            <Badge 
              variant={getStatusBadgeVariant(bill.status_desc || 'pending')}
              className="ml-4 shrink-0"
            >
              {bill.status_desc || 'Pending'}
            </Badge>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3">
            {bill.title || "A comprehensive bill to address various legislative matters."}
          </p>
          
          {/* Sponsor, Committee, and Date Info */}
          <div className="space-y-2 text-sm">
            {bill.primary_sponsor && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-medium">Rep. {bill.primary_sponsor.name}</span>
              </div>
            )}
            
            {bill.committee && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-gray-600">{bill.committee}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <span className="text-gray-600">
                {bill.status_date ? new Date(bill.status_date).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit', 
                  year: 'numeric'
                }) : 'No date'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
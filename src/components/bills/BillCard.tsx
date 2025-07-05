import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillWithSponsor } from "@/types/bills";
import { User, FileText, MapPin, Building, Calendar } from "lucide-react";

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

const getChamber = (billNumber: string) => {
  if (!billNumber) return '';
  const prefix = billNumber.charAt(0).toUpperCase();
  return prefix === 'S' ? 'Senate' : prefix === 'A' ? 'Assembly' : '';
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
          
          {/* Sponsor, Committee, Date, and Location Info */}
          <div className="space-y-2 text-sm">
            {bill.primary_sponsor && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{getChamber(bill.bill_number || '')}</span>
                </div>
                <User className="w-3 h-3 text-gray-500" />
                <span className="font-medium">{bill.primary_sponsor.name}</span>
              </div>
            )}
            
            {bill.committee && (
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600">{bill.committee}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">
                {bill.status_date ? new Date(bill.status_date).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit', 
                  year: 'numeric'
                }) : 'No date'}
              </span>
            </div>

            {bill.last_action && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 text-xs">{bill.last_action}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
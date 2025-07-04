import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BillWithSponsor } from "@/types/bills";

interface BillFiltersProps {
  bills: BillWithSponsor[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  committeeFilter: string;
  setCommitteeFilter: (committee: string) => void;
  monthFilter: string;
  setMonthFilter: (month: string) => void;
  sponsorFilter: string;
  setSponsorFilter: (sponsor: string) => void;
  onClearFilters: () => void;
}

export const BillFilters = ({
  bills,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  committeeFilter,
  setCommitteeFilter,
  monthFilter,
  setMonthFilter,
  sponsorFilter,
  setSponsorFilter,
  onClearFilters,
}: BillFiltersProps) => {
  const uniqueStatuses = [...new Set(bills.map(bill => bill.status_desc).filter(Boolean))];
  const uniqueCommittees = [...new Set(bills.map(bill => bill.committee).filter(Boolean))];
  const uniqueSponsors = [...new Set(bills.map(bill => bill.primary_sponsor?.name).filter(Boolean))].sort();
  const uniqueMonths = [...new Set(bills.map(bill => {
    if (!bill.status_date) return null;
    const billDate = new Date(bill.status_date);
    return billDate.toISOString().slice(0, 7); // YYYY-MM format
  }).filter(Boolean))].sort().reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      <Input
        placeholder="Search by bill number or title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger>
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {uniqueStatuses.map(status => (
            <SelectItem key={status} value={status}>{status}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
        <SelectTrigger>
          <SelectValue placeholder="All Committees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Committees</SelectItem>
          {uniqueCommittees.map(committee => (
            <SelectItem key={committee} value={committee}>{committee}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sponsorFilter} onValueChange={setSponsorFilter}>
        <SelectTrigger>
          <SelectValue placeholder="All Sponsors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sponsors</SelectItem>
          {uniqueSponsors.map(sponsor => (
            <SelectItem key={sponsor} value={sponsor}>{sponsor}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={monthFilter} onValueChange={setMonthFilter}>
        <SelectTrigger>
          <SelectValue placeholder="All Months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          {uniqueMonths.map(month => (
            <SelectItem key={month} value={month}>
              {new Date(month + '-01').toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        variant="outline" 
        onClick={onClearFilters}
      >
        Clear Filters
      </Button>
    </div>
  );
};
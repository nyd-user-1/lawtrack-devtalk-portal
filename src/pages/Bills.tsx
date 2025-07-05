
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BillWithSponsor } from "@/types/bills";
import { useBills, useBillDetails } from "@/hooks/useBills";
import { BillCard } from "@/components/bills/BillCard";
import { BillFilters } from "@/components/bills/BillFilters";
import { BillDetailDialog } from "@/components/bills/BillDetailDialog";

const Bills = () => {
  const { bills, filteredBills, setFilteredBills, loading, loadingMore, hasMore, loadMoreBills } = useBills();
  const { billSponsors, billHistory, billRollcalls, selectedRollcallVotes, detailLoading, fetchBillDetails, fetchVotes } = useBillDetails();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [selectedBill, setSelectedBill] = useState<BillWithSponsor | null>(null);

  useEffect(() => {
    filterBills();
  }, [bills, searchTerm, statusFilter, committeeFilter, sponsorFilter]);


  const filterBills = () => {
    let filtered = bills;

    if (searchTerm) {
      filtered = filtered.filter(
        bill =>
          bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(bill => bill.status_desc === statusFilter);
    }

    if (committeeFilter && committeeFilter !== "all") {
      filtered = filtered.filter(bill => bill.committee === committeeFilter);
    }

    if (sponsorFilter && sponsorFilter !== "all") {
      filtered = filtered.filter(bill => 
        bill.primary_sponsor?.name?.toLowerCase().trim() === sponsorFilter.toLowerCase().trim()
      );
    }

    setFilteredBills(filtered);
  };

  const openBillDetail = async (bill: BillWithSponsor) => {
    setSelectedBill(bill);
    await fetchBillDetails(bill.bill_id);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4 mb-8">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
          <div className="bills-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Bills</h1>
        
        <BillFilters
          bills={bills}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          committeeFilter={committeeFilter}
          setCommitteeFilter={setCommitteeFilter}
          sponsorFilter={sponsorFilter}
          setSponsorFilter={setSponsorFilter}
          onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("");
            setCommitteeFilter("");
            setSponsorFilter("");
          }}
        />

        <div className="bills-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill) => (
            <BillCard key={bill.bill_id} bill={bill} onClick={openBillDetail} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button 
              onClick={loadMoreBills} 
              disabled={loadingMore}
              variant="outline"
              size="lg"
            >
              {loadingMore ? "Loading..." : "Load More Bills"}
            </Button>
          </div>
        )}

        <BillDetailDialog
          selectedBill={selectedBill}
          onClose={() => setSelectedBill(null)}
          billSponsors={billSponsors}
          billHistory={billHistory}
          billRollcalls={billRollcalls}
          selectedRollcallVotes={selectedRollcallVotes}
          detailLoading={detailLoading}
          onFetchVotes={fetchVotes}
        />
      </div>
    </div>
  );
};

export default Bills;

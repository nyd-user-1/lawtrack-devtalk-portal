import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;
type Person = Tables<"People">;

interface BillWithSponsor extends Bill {
  primary_sponsor?: Person;
}

const Committee = () => {
  const { committee } = useParams<{ committee: string }>();
  const [bills, setBills] = useState<BillWithSponsor[]>([]);
  const [filteredBills, setFilteredBills] = useState<BillWithSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (committee) {
      fetchBills();
    }
  }, [committee]);

  useEffect(() => {
    filterBills();
  }, [bills, searchTerm, statusFilter, monthFilter]);

  const fetchBills = async (isLoadMore = false) => {
    if (!committee) return;

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }
      
      const decodedCommittee = decodeURIComponent(committee);
      console.log("Fetching bills for committee:", decodedCommittee);
      
      const currentOffset = isLoadMore ? offset : 0;
      const { data: billsData, error: billsError } = await supabase
        .from("Bills")
        .select("*")
        .eq("committee", decodedCommittee)
        .range(currentOffset, currentOffset + 99)
        .order("bill_id", { ascending: false });

      if (billsError) {
        console.error("Bills error:", billsError);
        throw billsError;
      }

      console.log("Bills fetched:", billsData?.length);

      if (!billsData || billsData.length === 0) {
        if (!isLoadMore) setBills([]);
        setHasMore(false);
        return;
      }

      setHasMore(billsData.length === 100);
      
      // Get all primary sponsors in one query
      const billIds = billsData.map(bill => bill.bill_id);
      const { data: sponsorsData } = await supabase
        .from("Sponsors")
        .select("bill_id, people_id, position")
        .in("bill_id", billIds)
        .eq("position", 1);

      // Get all people data for those sponsors
      const peopleIds = sponsorsData?.map(sponsor => sponsor.people_id) || [];
      const { data: peopleData } = await supabase
        .from("People")
        .select("*")
        .in("people_id", peopleIds);

      // Create maps for efficient lookup
      const sponsorMap = new Map(sponsorsData?.map(sponsor => [sponsor.bill_id, sponsor.people_id]) || []);
      const peopleMap = new Map(peopleData?.map(person => [person.people_id, person]) || []);

      // Combine the data
      const billsWithSponsors = billsData.map(bill => ({
        ...bill,
        primary_sponsor: sponsorMap.has(bill.bill_id) ? peopleMap.get(sponsorMap.get(bill.bill_id)) : null
      }));

      if (isLoadMore) {
        setBills(prev => [...prev, ...billsWithSponsors]);
        setOffset(currentOffset + 100);
      } else {
        setBills(billsWithSponsors);
        setOffset(100);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadMoreBills = () => {
    if (!loadingMore && hasMore) {
      fetchBills(true);
    }
  };

  const filterBills = () => {
    let filtered = bills;

    if (searchTerm) {
      filtered = filtered.filter(
        bill =>
          bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(bill => bill.status_desc === statusFilter);
    }

    if (monthFilter) {
      filtered = filtered.filter(bill => {
        if (!bill.status_date) return false;
        const billDate = new Date(bill.status_date);
        const billMonth = billDate.toISOString().slice(0, 7);
        return billMonth === monthFilter;
      });
    }

    setFilteredBills(filtered);
  };

  const uniqueStatuses = [...new Set(bills.map(bill => bill.status_desc).filter(Boolean))];
  const uniqueMonths = [...new Set(bills.map(bill => {
    if (!bill.status_date) return null;
    const billDate = new Date(bill.status_date);
    return billDate.toISOString().slice(0, 7);
  }).filter(Boolean))].sort().reverse();

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Committee: {decodeURIComponent(committee || "")}</h1>
          <p className="text-muted-foreground">Bills pending before this committee</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <SelectItem value="">All Statuses</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Months</SelectItem>
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
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setMonthFilter("");
            }}
          >
            Clear Filters
          </Button>
        </div>

        {filteredBills.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No bills found for this committee.</p>
          </div>
        ) : (
          <div className="bills-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBills.map((bill) => (
              <Card
                key={bill.bill_id}
                className="bill-card hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{bill.bill_number}</h3>
                      <Badge variant="secondary">{bill.status_desc}</Badge>
                    </div>
                    <h4 className="text-sm text-muted-foreground line-clamp-2">
                      {bill.title}
                    </h4>
                    {bill.primary_sponsor && (
                      <p className="text-sm">
                        <span className="font-medium">Sponsor:</span> {bill.primary_sponsor.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Updated: {bill.status_date}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default Committee;
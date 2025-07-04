import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;
type Person = Tables<"People">;
type Sponsor = Tables<"Sponsors">;
type History = Tables<"History">;
type Rollcall = Tables<"Rollcalls">;
type Vote = Tables<"Votes">;

interface BillWithSponsor extends Bill {
  primary_sponsor?: Person;
}

interface SponsorWithPerson extends Sponsor {
  person: Person;
}

interface VoteWithPerson extends Vote {
  person: Person;
}

const Bills = () => {
  const [bills, setBills] = useState<BillWithSponsor[]>([]);
  const [filteredBills, setFilteredBills] = useState<BillWithSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBill, setSelectedBill] = useState<BillWithSponsor | null>(null);
  const [billSponsors, setBillSponsors] = useState<SponsorWithPerson[]>([]);
  const [billHistory, setBillHistory] = useState<History[]>([]);
  const [billRollcalls, setBillRollcalls] = useState<Rollcall[]>([]);
  const [selectedRollcallVotes, setSelectedRollcallVotes] = useState<VoteWithPerson[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [bills, searchTerm, statusFilter]);

  const fetchBills = async () => {
    try {
      console.log("Fetching bills...");
      
      // Get first 50 bills for better performance
      const { data: billsData, error: billsError } = await supabase
        .from("Bills")
        .select("*")
        .limit(50)
        .order("status_date", { ascending: false });

      if (billsError) {
        console.error("Bills error:", billsError);
        throw billsError;
      }

      console.log("Bills fetched:", billsData?.length);

      if (!billsData || billsData.length === 0) {
        setBills([]);
        return;
      }

      // Get all primary sponsors in one query
      const billIds = billsData.map(bill => bill.bill_id);
      const { data: sponsorsData } = await supabase
        .from("Sponsors")
        .select("bill_id, people_id, position")
        .in("bill_id", billIds)
        .eq("position", 1);

      console.log("Sponsors fetched:", sponsorsData?.length);

      // Get all people data for those sponsors
      const peopleIds = sponsorsData?.map(sponsor => sponsor.people_id) || [];
      const { data: peopleData } = await supabase
        .from("People")
        .select("*")
        .in("people_id", peopleIds);

      console.log("People fetched:", peopleData?.length);

      // Create maps for efficient lookup
      const sponsorMap = new Map(sponsorsData?.map(sponsor => [sponsor.bill_id, sponsor.people_id]) || []);
      const peopleMap = new Map(peopleData?.map(person => [person.people_id, person]) || []);

      // Combine the data
      const billsWithSponsors = billsData.map(bill => ({
        ...bill,
        primary_sponsor: sponsorMap.has(bill.bill_id) ? peopleMap.get(sponsorMap.get(bill.bill_id)) : null
      }));

      console.log("Bills with sponsors:", billsWithSponsors.length);
      setBills(billsWithSponsors);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
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

    setFilteredBills(filtered);
  };

  const openBillDetail = async (bill: BillWithSponsor) => {
    setSelectedBill(bill);
    setDetailLoading(true);

    try {
      // Fetch sponsors
      const { data: sponsorsData } = await supabase
        .from("Sponsors")
        .select("*")
        .eq("bill_id", bill.bill_id);

      const sponsorsWithPeople = await Promise.all(
        (sponsorsData || []).map(async (sponsor) => {
          const { data: personData } = await supabase
            .from("People")
            .select("*")
            .eq("people_id", sponsor.people_id)
            .limit(1);

          return {
            ...sponsor,
            person: personData?.[0] || null
          };
        })
      );

      setBillSponsors(sponsorsWithPeople.filter(s => s.person));

      // Fetch history
      const { data: historyData } = await supabase
        .from("History")
        .select("*")
        .eq("bill_id", bill.bill_id)
        .order("sequence");

      setBillHistory(historyData || []);

      // Fetch rollcalls
      const { data: rollcallsData } = await supabase
        .from("Rollcalls")
        .select("*")
        .eq("bill_id", bill.bill_id)
        .order("date", { ascending: false });

      setBillRollcalls(rollcallsData || []);
    } catch (error) {
      console.error("Error fetching bill details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchVotes = async (rollCallId: number) => {
    try {
      const { data: votesData } = await supabase
        .from("Votes")
        .select("*")
        .eq("roll_call_id", rollCallId);

      const votesWithPeople = await Promise.all(
        (votesData || []).map(async (vote) => {
          const { data: personData } = await supabase
            .from("People")
            .select("*")
            .eq("people_id", vote.people_id)
            .limit(1);

          return {
            ...vote,
            person: personData?.[0] || null
          };
        })
      );

      setSelectedRollcallVotes(votesWithPeople.filter(v => v.person));
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  };

  const uniqueStatuses = [...new Set(bills.map(bill => bill.status_desc).filter(Boolean))];

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
        <h1 className="text-3xl font-bold mb-8">Legislative Bills</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="Search by bill number or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-80"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="bills-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill) => (
            <Card
              key={bill.bill_id}
              className="bill-card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => openBillDetail(bill)}
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

        <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
          <DialogContent className="bill-detail-modal max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedBill?.bill_number} - {selectedBill?.title}
              </DialogTitle>
            </DialogHeader>

            {detailLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-40" />
              </div>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="votes">Votes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedBill?.description || "No description available"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Status</h4>
                      <Badge>{selectedBill?.status_desc}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Last Action</h4>
                      <p className="text-sm">{selectedBill?.last_action}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sponsors">
                  <div className="sponsor-grid space-y-3">
                    {billSponsors.map((sponsor, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{sponsor.person.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {sponsor.person.party} - {sponsor.person.district}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {sponsor.position === 1 ? "Primary" : "Co-Sponsor"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="history-timeline space-y-3">
                    {billHistory.map((item, index) => (
                      <div key={index} className="border-l-2 border-muted pl-4 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.action}</p>
                            <p className="text-sm text-muted-foreground">{item.chamber}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="votes">
                  <div className="space-y-4">
                    {billRollcalls.map((rollcall) => (
                      <div key={rollcall.roll_call_id} className="border rounded p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{rollcall.description}</h4>
                            <p className="text-sm text-muted-foreground">
                              {rollcall.chamber} - {rollcall.date}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchVotes(rollcall.roll_call_id)}
                          >
                            View Votes
                          </Button>
                        </div>
                        <div className="vote-summary grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-green-600">{rollcall.yea}</p>
                            <p className="text-sm">Yea</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-red-600">{rollcall.nay}</p>
                            <p className="text-sm">Nay</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{rollcall.total}</p>
                            <p className="text-sm">Total</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {selectedRollcallVotes.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3">Individual Votes</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Legislator</TableHead>
                              <TableHead>Party</TableHead>
                              <TableHead>District</TableHead>
                              <TableHead>Vote</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedRollcallVotes.map((vote, index) => (
                              <TableRow key={index}>
                                <TableCell>{vote.person.name}</TableCell>
                                <TableCell>{vote.person.party}</TableCell>
                                <TableCell>{vote.person.district}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      vote.vote_desc === "Yea" ? "default" :
                                      vote.vote_desc === "Nay" ? "destructive" : "secondary"
                                    }
                                  >
                                    {vote.vote_desc}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Bills;
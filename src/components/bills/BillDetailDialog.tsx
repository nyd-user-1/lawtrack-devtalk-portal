import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BillWithSponsor, SponsorWithPerson, History, Rollcall, VoteWithPerson } from "@/types/bills";
import { User, FileText } from "lucide-react";

interface BillDetailDialogProps {
  selectedBill: BillWithSponsor | null;
  onClose: () => void;
  billSponsors: SponsorWithPerson[];
  billHistory: History[];
  billRollcalls: Rollcall[];
  selectedRollcallVotes: VoteWithPerson[];
  detailLoading: boolean;
  onFetchVotes: (rollCallId: number) => void;
}

export const BillDetailDialog = ({
  selectedBill,
  onClose,
  billSponsors,
  billHistory,
  billRollcalls,
  selectedRollcallVotes,
  detailLoading,
  onFetchVotes,
}: BillDetailDialogProps) => {
  return (
    <Dialog open={!!selectedBill} onOpenChange={onClose}>
      <DialogContent className="bill-detail-modal max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedBill?.bill_number}
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
                <h4 className="font-semibold mb-2">Title</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBill?.title || "No title available"}
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
              
              {/* Sponsor and Bill Text buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {billSponsors.length > 0 && (
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Sponsor Profile
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Bill Text
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="sponsors">
              <div className="sponsor-grid space-y-3">
                {billSponsors.length > 0 ? (
                  billSponsors.map((sponsor, index) => (
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
                  ))
                ) : (
                  <p className="text-muted-foreground">No sponsors found for this bill.</p>
                )}
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
                        onClick={() => onFetchVotes(rollcall.roll_call_id)}
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
  );
};
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BillWithSponsor, SponsorWithPerson, History, Rollcall, VoteWithPerson } from "@/types/bills";

export const useBills = () => {
  const [bills, setBills] = useState<BillWithSponsor[]>([]);
  const [filteredBills, setFilteredBills] = useState<BillWithSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchBills = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }
      
      console.log("Fetching bills...", isLoadMore ? "Loading more" : "Initial load");
      
      const currentOffset = isLoadMore ? offset : 0;
      const { data: billsData, error: billsError } = await supabase
        .from("Bills")
        .select("*")
        .range(currentOffset, currentOffset + 299)
        .order("status_date", { ascending: false });

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

      setHasMore(billsData.length === 300);
      
      const billIds = billsData.map(bill => bill.bill_id);
      const { data: sponsorsData } = await supabase
        .from("Sponsors")
        .select("bill_id, people_id, position")
        .in("bill_id", billIds)
        .order("position");

      console.log("Sponsors fetched:", sponsorsData?.length);

      const peopleIds = sponsorsData?.map(sponsor => sponsor.people_id) || [];
      const { data: peopleData } = await supabase
        .from("People")
        .select("*")
        .in("people_id", peopleIds);

      console.log("People fetched:", peopleData?.length);

      const primarySponsorMap = new Map();
      sponsorsData?.forEach(sponsor => {
        if (sponsor.position === 1) {
          primarySponsorMap.set(sponsor.bill_id, sponsor.people_id);
        }
      });
      
      const peopleMap = new Map(peopleData?.map(person => [person.people_id, person]) || []);

      const billsWithSponsors = billsData.map(bill => ({
        ...bill,
        primary_sponsor: primarySponsorMap.has(bill.bill_id) ? peopleMap.get(primarySponsorMap.get(bill.bill_id)) : null
      }));

      console.log("Bills with sponsors:", billsWithSponsors.length);
      console.log("Bills with actual sponsors:", billsWithSponsors.filter(b => b.primary_sponsor).length);
      
      if (isLoadMore) {
        setBills(prev => [...prev, ...billsWithSponsors]);
        setOffset(currentOffset + 300);
      } else {
        setBills(billsWithSponsors);
        setOffset(300);
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

  useEffect(() => {
    fetchBills();
  }, []);

  return {
    bills,
    filteredBills,
    setFilteredBills,
    loading,
    loadingMore,
    hasMore,
    loadMoreBills,
  };
};

export const useBillDetails = () => {
  const [billSponsors, setBillSponsors] = useState<SponsorWithPerson[]>([]);
  const [billHistory, setBillHistory] = useState<History[]>([]);
  const [billRollcalls, setBillRollcalls] = useState<Rollcall[]>([]);
  const [selectedRollcallVotes, setSelectedRollcallVotes] = useState<VoteWithPerson[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchBillDetails = async (billId: number) => {
    setDetailLoading(true);
    setSelectedRollcallVotes([]);

    try {
      const { data: sponsorsData } = await supabase
        .from("Sponsors")
        .select("*")
        .eq("bill_id", billId)
        .order("position");

      if (sponsorsData && sponsorsData.length > 0) {
        const sponsorPeopleIds = sponsorsData.map(sponsor => sponsor.people_id);
        const { data: peopleData } = await supabase
          .from("People")
          .select("*")
          .in("people_id", sponsorPeopleIds);

        const peopleMap = new Map(peopleData?.map(person => [person.people_id, person]) || []);
        
        const sponsorsWithPeople = sponsorsData.map(sponsor => ({
          ...sponsor,
          person: peopleMap.get(sponsor.people_id)
        })).filter(s => s.person);

        setBillSponsors(sponsorsWithPeople);
      } else {
        setBillSponsors([]);
      }

      const { data: historyData } = await supabase
        .from("History")
        .select("*")
        .eq("bill_id", billId)
        .order("sequence");

      setBillHistory(historyData || []);

      const { data: rollcallsData } = await supabase
        .from("Rollcalls")
        .select("*")
        .eq("bill_id", billId)
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

  return {
    billSponsors,
    billHistory,
    billRollcalls,
    selectedRollcallVotes,
    detailLoading,
    fetchBillDetails,
    fetchVotes,
  };
};
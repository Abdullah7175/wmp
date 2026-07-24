"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Building2, MapPin, Shield, X, Send, AlertCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SCOPE_LABELS = {
  global: "Global",
  division: "Division",
  district: "District",
  town: "Town",
};

export default function MarkToModal({ showMarkToModal, onClose, fileId, fileNumber, subject, onSuccess }) {
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [ccSearchTerm, setCcSearchTerm] = useState("");
  const [remarks, setRemarks] = useState("");
  const [fetching, setFetching] = useState(false);
  const [marking, setMarking] = useState(false);
  const [allowedRecipients, setAllowedRecipients] = useState([]);
  const [allUsersForCc, setAllUsersForCc] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCcIds, setSelectedCcIds] = useState([]);
  const [error, setError] = useState(null);
  const [canMark, setCanMark] = useState(true);
  const [isAssignedToSomeoneElse, setIsAssignedToSomeoneElse] = useState(false);
  const [assignedToName, setAssignedToName] = useState(null);
  const [fileCreatorId, setFileCreatorId] = useState(null);

  useEffect(() => {
    if (!showMarkToModal || !fileId) {
      return;
    }

    let active = true;
    async function loadRecipients() {
      setFetching(true);
      setError(null);
      setAllowedRecipients([]);
      setSelectedIds([]);
      setSelectedCcIds([]);
      setCcSearchTerm("");

      try {
        const [res, usersRes] = await Promise.all([
          fetch(`/api/efiling/files/${fileId}/mark-to`, { cache: "no-store" }),
          fetch(`/api/efiling/users?is_active=true`, { cache: "no-store" }),
        ]);
        if (!active) return;

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || `Failed to load recipients (${res.status})`);
        }

        const data = await res.json();
        setAllowedRecipients(Array.isArray(data.allowed_recipients) ? data.allowed_recipients : []);
        setCanMark(data.can_mark !== false);
        setIsAssignedToSomeoneElse(data.is_assigned_to_someone_else === true);
        setAssignedToName(data.assigned_to_name || null);
        setFileCreatorId(data.created_by || null);

        if (usersRes.ok) {
          const usersPayload = await usersRes.json().catch(() => []);
          const usersList = Array.isArray(usersPayload)
            ? usersPayload
            : Array.isArray(usersPayload?.users)
              ? usersPayload.users
              : [];
          setAllUsersForCc(
            usersList.map((u) => ({
              id: u.id,
              user_name: u.user_name || u.name,
              role_name: u.role_name,
              role_code: u.role_code,
              department_name: u.department_name,
              district_name: u.district_name,
              town_name: u.town_name,
              division_name: u.division_name,
            }))
          );
        } else {
          setAllUsersForCc([]);
        }
      } catch (err) {
        if (!active) return;
        console.error("Failed to load mark-to recipients:", err);
        setError(err.message || "Unable to load allowed recipients");
      } finally {
        if (active) {
          setFetching(false);
        }
      }
    }

    loadRecipients();
    return () => {
      active = false;
    };
  }, [showMarkToModal, fileId]);

  const handleToggleRecipient = (recipientId) => {
    setSelectedIds((prev) => {
      if (prev.includes(recipientId)) {
        return prev.filter((id) => id !== recipientId);
      }
      return [...prev, recipientId];
    });
    setSelectedCcIds((prev) => prev.filter((id) => id !== recipientId));
  };

  const handleToggleCc = (userId) => {
    if (selectedIds.includes(userId)) {
      toast({
        title: "Already selected as Mark To",
        description: "Choose a different user for CC.",
        variant: "destructive",
      });
      return;
    }
    setSelectedCcIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const filteredRecipients = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allowedRecipients;

    return allowedRecipients.filter((recipient) => {
      const fields = [
        recipient.user_name,
        recipient.role_name,
        recipient.role_code,
        recipient.department_name,
        recipient.district_name,
        recipient.town_name,
        recipient.division_name,
      ];
      return fields.some((field) => field && field.toLowerCase().includes(term));
    });
  }, [allowedRecipients, searchTerm]);

  const ccCandidates = useMemo(() => {
    return allUsersForCc.filter((user) => {
      if (fileCreatorId && Number(user.id) === Number(fileCreatorId)) return false;
      if (selectedIds.includes(user.id)) return false;
      return true;
    });
  }, [allUsersForCc, selectedIds, fileCreatorId]);

  const filteredCcUsers = useMemo(() => {
    const term = ccSearchTerm.toLowerCase().trim();
    if (!term) return ccCandidates;
    return ccCandidates.filter((user) => {
      const fields = [
        user.user_name,
        user.role_name,
        user.role_code,
        user.department_name,
        user.district_name,
        user.town_name,
        user.division_name,
      ];
      return fields.some((field) => field && field.toLowerCase().includes(term));
    });
  }, [ccCandidates, ccSearchTerm]);

  const selectedRecipients = useMemo(
    () => allowedRecipients.filter((recipient) => selectedIds.includes(recipient.id)),
    [allowedRecipients, selectedIds]
  );

  const selectedCcUsers = useMemo(
    () => allUsersForCc.filter((user) => selectedCcIds.includes(user.id)),
    [allUsersForCc, selectedCcIds]
  );

  const summaryRemarks = useMemo(() => {
    if (remarks.trim()) return remarks.trim();
    if (selectedRecipients.length === 0) return "";
    const names = selectedRecipients.map((r) => r.user_name).join(", ");
    const ccNames = selectedCcUsers.map((r) => r.user_name).join(", ");
    return ccNames
      ? `File forwarded to ${names}; CC: ${ccNames}`
      : `File forwarded to ${names}`;
  }, [remarks, selectedRecipients, selectedCcUsers]);

  const handleSubmit = async () => {
    if (selectedRecipients.length === 0) {
      toast({
        title: "No recipient selected",
        description: "Please choose an allowed user to mark the file to.",
        variant: "destructive",
      });
      return;
    }

    if (selectedRecipients.length > 1) {
      toast({
        title: "Multiple recipients not allowed",
        description: "Please select only one user at a time (sequential workflow).",
        variant: "destructive",
      });
      return;
    }

    setMarking(true);
    try {
      const res = await fetch(`/api/efiling/files/${fileId}/mark-to`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ids: selectedRecipients.map((r) => r.id),
          cc_user_ids: selectedCcIds,
          remarks: summaryRemarks,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to mark file");
      }

      const result = await res.json();
      const tatStarted = result.tat_started;
      const isTeamInternal = result.is_team_internal || false;
      const ccCount = result.cc_count || selectedCcIds.length;
      const ccSuffix = ccCount > 0 ? ` (CC: ${ccCount})` : "";

      toast({
        title: "Marked successfully",
        description: tatStarted
          ? `File marked to ${selectedRecipients[0].user_name}${ccSuffix}. TAT timer has started.`
          : isTeamInternal
            ? `File marked to ${selectedRecipients[0].user_name}${ccSuffix} (Team workflow - No TAT).`
            : `File marked to ${selectedRecipients[0].user_name}${ccSuffix}.`,
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Failed to mark file:", err);
      toast({
        title: "Unable to mark",
        description: err.message || "Unable to mark file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMarking(false);
    }
  };

  if (!showMarkToModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Mark File To Users</h2>
            <p className="text-sm text-gray-600 mt-1">
              {fileNumber} - {subject}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isAssignedToSomeoneElse && !canMark && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-yellow-900 mb-1">File Already Assigned</div>
                  <p className="text-sm text-yellow-700">
                    This file is already assigned to <strong>{assignedToName || "another user"}</strong>.
                    You cannot mark this file to another user at this time.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Mark To (primary)</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">Search by name, role, department, or location</p>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, role, department, or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg max-h-56 overflow-y-auto">
                {fetching && allowedRecipients.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">Loading allowed recipients...</div>
                ) : filteredRecipients.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    {error || "No recipients match your search."}
                  </div>
                ) : (
                  filteredRecipients.map((recipient) => {
                    const selected = selectedIds.includes(recipient.id);
                    const scopeLabel =
                      SCOPE_LABELS[recipient.allowed_level_scope?.toLowerCase?.()] ||
                      recipient.allowed_level_scope;
                    const isTeamMember = recipient.is_team_member;
                    const willStartTAT = ["SE", "CE", "CFO", "COO", "CEO"].includes(
                      (recipient.role_code || "").toUpperCase()
                    );

                    return (
                      <Card
                        key={recipient.id}
                        className={`transition-colors mb-2 ${
                          !canMark ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        } ${selected ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"}`}
                        onClick={() => canMark && handleToggleRecipient(recipient.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {}}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-blue-600 rounded mt-0.5 flex-shrink-0"
                              disabled={!canMark}
                              readOnly
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="font-medium text-sm">{recipient.user_name}</div>
                                {isTeamMember && (
                                  <Badge variant="secondary" className="text-xs">
                                    Team Member
                                  </Badge>
                                )}
                                {willStartTAT && (
                                  <Badge className="bg-orange-100 text-orange-800 text-xs">Will Start TAT</Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  <span>
                                    {recipient.role_name} ({recipient.role_code})
                                  </span>
                                </div>
                                {recipient.department_name && (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    <span>{recipient.department_name}</span>
                                  </div>
                                )}
                                {(recipient.district_name ||
                                  recipient.town_name ||
                                  recipient.division_name) && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>
                                      {[
                                        recipient.division_name,
                                        recipient.district_name,
                                        recipient.town_name,
                                      ]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </span>
                                  </div>
                                )}
                                {scopeLabel && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Scope: {scopeLabel.toLowerCase()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="mt-6">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  CC (optional) — anyone can be copied
                </Label>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  CC users are notified and can view the file. Assignment and SLA stay with Mark To only.
                </p>
                {selectedCcUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCcUsers.map((user) => (
                      <Badge key={`cc-badge-${user.id}`} variant="outline" className="gap-1">
                        {user.user_name}
                        <button type="button" onClick={() => handleToggleCc(user.id)} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users to CC"
                    value={ccSearchTerm}
                    onChange={(e) => setCcSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={!canMark}
                  />
                </div>
                <div className="border rounded-lg max-h-44 overflow-y-auto bg-slate-50">
                  {fetching && allUsersForCc.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">Loading users...</div>
                  ) : filteredCcUsers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No users to CC.</div>
                  ) : (
                    filteredCcUsers.map((user) => {
                      const selected = selectedCcIds.includes(user.id);
                      return (
                        <button
                          key={`cc-${user.id}`}
                          type="button"
                          onClick={() => canMark && handleToggleCc(user.id)}
                          disabled={!canMark}
                          className={`w-full text-left p-2.5 border-b transition ${
                            selected ? "bg-violet-50 border-violet-200" : "hover:bg-white"
                          } ${!canMark ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selected}
                              readOnly
                              className="w-4 h-4 text-violet-600 rounded mt-0.5"
                              disabled={!canMark}
                            />
                            <div>
                              <div className="font-medium text-sm">{user.user_name}</div>
                              <div className="text-xs text-gray-600">
                                {user.role_name}
                                {user.department_name ? ` · ${user.department_name}` : ""}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-sm font-medium">Remarks (optional)</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide any remarks for the recipients"
                  className="mt-2"
                  rows={4}
                />
                {summaryRemarks && (
                  <p className="mt-2 text-xs text-gray-500">
                    This message will be stored with the movement:
                    <br />
                    <span className="text-gray-700">{summaryRemarks}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={marking || selectedRecipients.length === 0 || !canMark}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {marking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Marking...
              </>
            ) : !canMark ? (
              "Cannot Mark File"
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Mark To {selectedRecipients[0]?.user_name || "User"}
                {selectedCcIds.length > 0 ? ` + CC ${selectedCcIds.length}` : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

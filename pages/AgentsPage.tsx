import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, UserCheck, TrendingUp, Search, Filter, Plus, Eye, Mail, Phone, Edit, EyeOff, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { toast } from 'sonner';
import { AddAgentModal } from '../components/AddAgentModal';
import { EditAgentModal } from '../components/EditAgentModal';
import { DeactivationPeriodModal } from '../components/DeactivationPeriodModal';
import { Agent, AgentResponse, ShipmentStatusString } from '../types';
import { agentsAPI, shipmentsAPI } from '../services/api';
import { useEffect } from 'react';

export function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentResponse | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  const [activeAgentsCount, setActiveAgentsCount] = useState(0);
  const [onDutyAgentsCount, setOnDutyAgentsCount] = useState(0);
  const [editAgentModalOpen, setEditAgentModalOpen] = useState(false);
  const [deactivationModalOpen, setDeactivationModalOpen] = useState(false);
  const [hiddenAgentIds, setHiddenAgentIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hiddenAgentIds');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('hiddenAgentIds', JSON.stringify(Array.from(hiddenAgentIds)));
  }, [hiddenAgentIds]);
  const [hiddenAgentsDialogOpen, setHiddenAgentsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [lockedAgents, setLockedAgents] = useState<AgentResponse[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const loadLockedAgents = async () => {
    try {
      const response = await agentsAPI.getLockedAgents();
      setLockedAgents(response);
    } catch (error) {
      console.error('Failed to load locked agents:', error);
      toast.error('Failed to load locked agents');
    }
  };


  const fetchAgents = async () => {
    try {
      const data = await agentsAPI.getAll();
      console.log(data)
      setAgents(data);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      toast.error("Failed to load agents list.");
    }
  };
  const fetchActiveAgentsCount = async () => {
    try {
      const data = await agentsAPI.getActiveCount();
      console.log(data)
      setActiveAgentsCount(data);
    } catch (error) {
      console.error("Failed to fetch active agents count:", error);
      toast.error("Failed to load active agents count.");
    }
  };
  const fetchOnDutyAgentsCount = async () => {
    try {
      const data = await shipmentsAPI.getAll();
      console.log(data)
      const onDutyAgents = data.filter(shipment => shipment.statusOrder === ShipmentStatusString.DeliveredToAgent
        || shipment.statusOrder === ShipmentStatusString.Returned).length;
      setOnDutyAgentsCount(onDutyAgents);
    } catch (error) {
      console.error("Failed to fetch on duty agents count:", error);
      toast.error("Failed to load on duty agents count.");
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchActiveAgentsCount();
    fetchOnDutyAgentsCount();
  }, []);

  useEffect(() => {
    if (activeTab === 'locked') {
      loadLockedAgents();
    } else if (activeTab === 'all') {
      fetchAgents();
    }
  }, [activeTab]);

  // Calculate statistics
  const totalAgents = agents.length;

  // Active agents: those with assignments within 2 days
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  // console.log(twoDaysAgo)


  // Filter agents based on search and hidden status
  const filteredAgents = useMemo(() => {
    let filtered = agents.filter(agent => !hiddenAgentIds.has(agent.id.toString()));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query) ||
        // agent.id.toLowerCase().includes(query) ||
        (agent.branshName && agent.branshName.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, hiddenAgentIds, agents]);

  const hiddenAgents = agents.filter(agent => hiddenAgentIds.has(agent.id.toString()));

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (agent: AgentResponse) => {
    setSelectedAgent(agent);
    setDetailsModalOpen(true);
  };

  const handleEditAgent = (agent: AgentResponse) => {
    setSelectedAgent(agent);
    setEditAgentModalOpen(true);
  };

  const handleHideAgent = (agentId: string) => {
    setHiddenAgentIds(prev => {
      const newSet = new Set(prev);
      newSet.add(agentId);
      return newSet;
    });
    toast.success('Agent hidden successfully');
  };

  const handleRestoreAgent = (agentId: string) => {
    setHiddenAgentIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(agentId);
      return newSet;
    });
    toast.success('Agent restored successfully');
  };

  const handleRestoreAllAgents = () => {
    setHiddenAgentIds(new Set());
    setHiddenAgentsDialogOpen(false);
    toast.success('All agents restored successfully');
  };

  const handleSetDeactivationPeriod = (agent: AgentResponse) => {
    setSelectedAgent(agent);
    setDeactivationModalOpen(true);
  };

  const handleToggleStatus = async (agentId: string, currentStatus: 'active' | 'inactive') => {
    if (currentStatus === 'active') {
      // User wants to deactivate/lock
      const agent = agents.find(a => a.id.toString() === agentId);
      if (agent) {
        handleSetDeactivationPeriod(agent);
      }
    } else {
      // User wants to activate (unlock)
      try {
        await agentsAPI.activate(agentId);

        // Update local state
        setAgents(prev =>
          prev.map(a =>
            a.id.toString() === agentId ? { ...a, isactive: true, isLock: false } : a
          )
        );

        // Remove from locked agents list if present
        setLockedAgents(prev => prev.filter(a => a.id.toString() !== agentId));

        toast.success('Agent activated successfully');
      } catch (error) {
        console.error('Failed to activate agent:', error);
        toast.error('Failed to activate agent');
      }
    }
  };

  const handleDeactivationPeriodSuccess = (fromDate: string | null, toDate: string | null) => {
    if (!selectedAgent) return;

    // Update the agent in the list
    setAgents(prev =>
      prev.map(a =>
        a.id.toString() === selectedAgent.id.toString()
          ? {
            ...a,
            deactivationFrom: fromDate || undefined,
            deactivationTo: toDate || undefined,
            isLock: true,
          }
          : a
      )
    );

    // Add to locked agents list if not already there (optional, but good for consistency)
    // We might need to fetch the full agent details or just push the modified selectedAgent
    // For now, let's just update the main list. If the user switches to the locked tab, it will refetch.
  };

  const isTemporarilyDeactivated = (agent: AgentResponse): boolean => {
    // console.log(agent.deactivationFrom, agent.deactivationTo);
    // console.log(!agent.deactivationFrom || !agent.deactivationTo);
    if (!agent.isLock) return false;

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    const from = new Date();
    from.setHours(0, 0, 0, 0);

    const to = new Date(agent.date);
    to.setHours(23, 59, 59, 999); // End of day

    return now >= from && now <= to;
  };

  const isScheduledForFuture = (agent: AgentResponse): boolean => {
    if (!agent.isLock) return false;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const from = new Date();
    from.setHours(0, 0, 0, 0);

    return from > now;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-green-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Agents Management</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track all delivery agents
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Total Agents
                  </p>
                  <p className="text-3xl mb-1">{totalAgents}</p>
                  <p className="text-sm text-slate-500">All registered agents</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Active Agents
                  </p>
                  <p className="text-3xl mb-1">{activeAgentsCount}</p>
                  <p className="text-sm text-slate-500">Active agents</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* On Duty */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    On Duty
                  </p>
                  <p className="text-3xl mb-1">{onDutyAgentsCount}</p>
                  <p className="text-sm text-slate-500">Currently working agents</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Apply Filter
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                {hiddenAgents.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setHiddenAgentsDialogOpen(true)}
                    className="gap-2"
                  >
                    <EyeOff className="w-4 h-4" />
                    Hidden ({hiddenAgents.length})
                  </Button>
                )}
                <Button
                  className="gap-2 bg-gradient-to-r from-green-500 to-green-600"
                  onClick={() => setAddAgentModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add New Agent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Agents</TabsTrigger>
            <TabsTrigger value="locked">Locked Agents</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-6">
          {/* Agents Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Manage and track your items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>AGENT</TableHead>
                        {/* <TableHead>ID</TableHead> */}
                        <TableHead>BRANCH</TableHead>
                        <TableHead>CONTACT</TableHead>
                        <TableHead>EMAIL</TableHead>
                        <TableHead>ACTIVE ORDERS</TableHead>
                        <TableHead>TODAY'S ORDERS</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAgents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2 text-slate-500">
                              <Users className="w-12 h-12 opacity-20" />
                              <p>No agents found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedAgents.map((agent, index) => (
                          <TableRow key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className={`${getAvatarColor(index)} text-white`}>
                                  <AvatarFallback className="bg-transparent">
                                    {getInitials(agent.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{agent.name}</span>
                              </div>
                            </TableCell>
                            {/* <TableCell className="text-slate-600 dark:text-slate-400">
                              {
                                String(agent.id).includes('-')
                                  ? String(agent.id).split('-')[1]
                                  : String(agent.id)
                              }
                            </TableCell> */}
                            <TableCell>
                              <span className="text-slate-700 dark:text-slate-300">
                                {agent.branshName || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">{agent.phoneNumber}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {agent.email}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {agent.numberofOrder}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  agent.numberofOrder && agent.numberofOrder > 0
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                                }
                              >
                                {agent.numberofOrder || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-3">
                                  <Switch
                                    checked={agent.isactive && !isTemporarilyDeactivated(agent)}
                                    onCheckedChange={() => handleToggleStatus(agent.id.toString(), agent.isactive ? 'active' : 'inactive')}
                                    className="data-[state=checked]:bg-green-500"
                                  />
                                  <span className={`text-sm font-semibold ${agent.isactive === true && !isTemporarilyDeactivated(agent)
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {agent.isactive === true && !isTemporarilyDeactivated(agent) ? 'Active' : 'inactive'}
                                  </span>
                                </div>
                                {isTemporarilyDeactivated(agent) && agent.isLock && (
                                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-2.5 py-1.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <CalendarClock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                                      <span className="text-xs text-amber-900 dark:text-amber-200 font-semibold">Currently Deactivated</span>
                                    </div>
                                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                      Deactivated until {formatDate(new Date().toString())}. Cannot log in during this period.
                                    </p>
                                  </div>
                                )}
                                {agent.isLock && !isTemporarilyDeactivated(agent) && (
                                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-2.5 py-1.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <CalendarClock className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 flex-shrink-0" />
                                      <span className="text-xs text-blue-900 dark:text-blue-200 font-semibold">Scheduled Deactivation</span>
                                    </div>
                                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                      From {formatDate(new Date().toString())} to {formatDate(new Date().toString())}.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetDeactivationPeriod(agent)}
                                  className="gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  title="Set Deactivation Period"
                                >
                                  <CalendarClock className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(agent)}
                                  className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAgent(agent)}
                                  className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Edit Agent"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleHideAgent(agent.id.toString())}
                                  className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Hide Agent"
                                >
                                  <EyeOff className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAgents.length)} of {filteredAgents.length} items
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? 'bg-blue-600' : ''}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="locked" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Locked Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>AGENT</TableHead>
                        <TableHead>BRANCH</TableHead>
                        <TableHead>CONTACT</TableHead>
                        <TableHead>EMAIL</TableHead>
                        <TableHead>ACTIVE ORDERS</TableHead>
                        <TableHead>TODAY'S ORDERS</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lockedAgents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2 text-slate-500">
                              <Users className="w-12 h-12 opacity-20" />
                              <p>No locked agents found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        lockedAgents.map((agent, index) => (
                          <TableRow key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className={`${getAvatarColor(index)} text-white`}>
                                  <AvatarFallback className="bg-transparent">
                                    {getInitials(agent.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{agent.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-slate-700 dark:text-slate-300">
                                {agent.branshName || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">{agent.phoneNumber}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {agent.email}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {agent.numberofOrder}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  agent.numberofOrder && agent.numberofOrder > 0
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                                }
                              >
                                {agent.numberofOrder || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-3">
                                  <Switch
                                    checked={false}
                                    onCheckedChange={() => handleToggleStatus(agent.id.toString(), 'inactive')}
                                    className="data-[state=checked]:bg-green-500"
                                  />
                                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    Locked
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetDeactivationPeriod(agent)}
                                  className="gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  title="Set Deactivation Period"
                                >
                                  <CalendarClock className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(agent)}
                                  className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAgent(agent)}
                                  className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Edit Agent"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleHideAgent(agent.id.toString())}
                                  className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Hide Agent"
                                >
                                  <EyeOff className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Agent Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this agent
            </DialogDescription>
          </DialogHeader>

          {selectedAgent && (
            <div className="space-y-6">
              {/* Agent Info */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Avatar className={`${getAvatarColor(agents.indexOf(selectedAgent))} text-white w-16 h-16 text-xl`}>
                  <AvatarFallback className="bg-transparent">
                    {getInitials(selectedAgent.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl mb-1">{selectedAgent.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Agent ID: {selectedAgent.id}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      className={
                        selectedAgent.isactive === true && !isTemporarilyDeactivated(selectedAgent)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }
                    >
                      {selectedAgent.isactive === true && !isTemporarilyDeactivated(selectedAgent) ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="secondary">
                      {selectedAgent.numberofOrder} Active Orders
                    </Badge>
                    {selectedAgent.numberofOrder && selectedAgent.numberofOrder > 0 && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {selectedAgent.numberofOrder} Today
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                  <p className="font-medium">{selectedAgent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                  <p className="font-medium">{selectedAgent.phoneNumber}</p>
                </div>
                {selectedAgent.branshName && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Branch</p>
                    <p className="font-medium">{selectedAgent.branshName}</p>
                  </div>
                )}
                {/* {selectedAgent.branshName && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Zone</p>
                    <p className="font-medium">{selectedAgent.branshName}</p>
                  </div>
                )} */}
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl mb-1">{selectedAgent.numberofOrder}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">{selectedAgent.numberofOrder}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">{selectedAgent.profit}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Profit</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Joined Date</p>
                  <p className="font-medium">
                    {selectedAgent?.date?.toString() || 'N/A'}
                  </p>
                </div>
                {/* {selectedAgent.date && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Last Assignment</p>
                    <p className="font-medium">
                      {new Date(selectedAgent.date).toLocaleDateString()}
                    </p>
                  </div>
                )} */}
              </div>

              {/* Deactivation Period Info */}
              {(isTemporarilyDeactivated(selectedAgent) || (selectedAgent.isLock && isScheduledForFuture(selectedAgent))) && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CalendarClock className="w-5 h-5" />
                    Deactivation Period
                  </h4>
                  {isTemporarilyDeactivated(selectedAgent) && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        Temporarily Deactivated
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        This agent is deactivated until <span className="font-semibold">{selectedAgent.isLock && formatDate(new Date().toDateString())}</span>. They cannot log in or perform any actions during this period.
                      </p>
                    </div>
                  )}
                  {selectedAgent.isLock && !isTemporarilyDeactivated(selectedAgent) && isScheduledForFuture(selectedAgent) && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        Scheduled Deactivation
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        This agent will be deactivated from <span className="font-semibold">{formatDate(new Date().toDateString())}</span> to <span className="font-semibold">{formatDate(new Date().toDateString())}</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Agent Modal */}
      <AddAgentModal
        open={addAgentModalOpen}
        onOpenChange={setAddAgentModalOpen}
        onSuccess={() => {
          fetchAgents();
          // TODO: Refresh agents list
          console.log('Agent added, refreshing list...');
        }}
      />

      {/* Edit Agent Modal */}
      <EditAgentModal
        open={editAgentModalOpen}
        onOpenChange={setEditAgentModalOpen}
        agent={selectedAgent}
        onSuccess={() => {
          fetchAgents();
          // TODO: Refresh agents list
          console.log('Agent updated, refreshing list...');
        }}
      />

      {/* Deactivation Period Modal */}
      <DeactivationPeriodModal
        open={deactivationModalOpen}
        onOpenChange={setDeactivationModalOpen}
        agentId={selectedAgent?.id || ''}
        agentName={selectedAgent?.name || ''}
        itemType="Agent"

        currentFromDate={Date.now}
        // currentToDate={selectedAgent?.deactivationTo}
        onSuccess={handleDeactivationPeriodSuccess}
      />

      {/* Hidden Agents Dialog */}
      <Dialog open={hiddenAgentsDialogOpen} onOpenChange={setHiddenAgentsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5" />
              Hidden Agents ({hiddenAgents.length})
            </DialogTitle>
            <DialogDescription>
              Manage agents that have been hidden from the main list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {hiddenAgents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No hidden agents</p>
              </div>
            ) : (
              <div className="space-y-2">
                {hiddenAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className={`${getAvatarColor(index)} text-white`}>
                        <AvatarFallback className="bg-transparent">
                          {getInitials(agent.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-slate-500">{agent.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreAgent(agent.id.toString())}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHiddenAgentsDialogOpen(false)}>
              Close
            </Button>
            {hiddenAgents.length > 0 && (
              <Button
                onClick={handleRestoreAllAgents}
                className="bg-gradient-to-r from-green-500 to-green-600"
              >
                Restore All
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

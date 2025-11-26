// ✅ api.ts — Clean, TypeScript, Connected to .NET backend
import { UserRole } from "@/contexts/AuthContext";
import {
  Shipment,
  WalletSummary,
  Agent,
  Seller,
  Branch,
  Zone,
  LoggedInUser,
  OrderRequest,
  OrderResponse,
  OrderResponseDetails,
  ZoneRequest,
  ZoneResponseDetails,
  ZoneResponse,
  NewBranchRequest,
  BranchResponse,
  BranchData,
  User,
  OrderUpdate,
  ZoneUpdate,
  BranchResponseDetails,
  BranchUpdate,
  ShipmentStatus,
  ChangeSateOrdersRequest,
  ZonesForSellerResponse,
  OrderRequestSeller,
  OrderUpdateSeller,
} from "../types";
import { Activity } from "../lib/mockData";

// -------------------- Base URLs --------------------

const AUTH_BASE_URL = "http://91.98.160.24:5001/api"

const BASE_URLS = {
  SuperAdmin: "http://91.98.160.24:5000/api",
  Admin: "http://91.98.160.24:5000/api",
  Seller: "http://91.98.160.24:8080/api",
  Agent: "http://91.98.160.24:8081/api",
};

export enum apiMode {
  auth = "auth",
}

// -------------------- Helpers --------------------
function getBaseUrl(role?: 'SuperAdmin' | 'Admin' | 'Seller' | 'Agent'): string {
  const effectiveRole = role === 'SuperAdmin' ? 'Admin' : role;
  if (effectiveRole && BASE_URLS[effectiveRole]) return BASE_URLS[effectiveRole];

  const savedRole = localStorage.getItem('role') as 'SuperAdmin' | 'Admin' | 'Seller' | 'Agent' | null;
  // Normalize saved role to match keys if necessary (though AuthContext should save correctly now)
  // But just in case, we can check directly
  if (savedRole && BASE_URLS[savedRole]) return BASE_URLS[savedRole];

  return BASE_URLS.Agent;
}


// -------------------- Generic API Call --------------------
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
  role?: 'SuperAdmin' | "Admin" | "Seller" | "Agent",
  mode?: apiMode
): Promise<T> {
  const token = localStorage.getItem("token");
  const baseUrl = mode === apiMode.auth ? AUTH_BASE_URL : getBaseUrl(role);
  const finalUrl = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;

  try {
    const response = await fetch(finalUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && mode !== apiMode.auth ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status == 401 && mode == apiMode.auth) {
        throw new Error("invalid Credentials");
      }
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("❌ API call failed:", error);
    throw error;
  }
}

// -------------------- Authentication APIs --------------------
export async function loginApi(
  email: string,
  password: string
): Promise<Partial<LoggedInUser>> {
  // const baseUrl = getBaseUrl(role);
  try {
    const result = await apiCall<LoggedInUser>(
      "/Authentication/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      undefined,
      apiMode.auth

      
    );
    if (result.token) {
      localStorage.setItem("token", result.token);
    }
    if (result.role) {
      localStorage.setItem("role", result.role);
    } else {
      localStorage.removeItem("role");
      console.warn("Backend did NOT send a role!");
    }
    return result;
  } catch (error: any) {
    throw new Error(error);
  }
}
// 🔹 Check if Email Exists
export async function emailExistApi(email: string): Promise<boolean> {
  return await apiCall<boolean>(
    `/Authentication/EmailExist?email=${encodeURIComponent(email)}`,
    { method: "GET" },
    undefined,
    apiMode.auth
  );
}

// 🔹 Agent Register
export async function agentRegisterApi(data: any) {
  return await apiCall<any>(
    "/Authentication/AgentRegister",
    { method: "POST", body: JSON.stringify(data) },
    undefined,
    apiMode.auth
  );
}

// 🔹 Seller Register
export async function sellerRegisterApi(data: any) {
  return await apiCall<any>(
    "/Authentication/SellerRegister",
    { method: "POST", body: JSON.stringify(data) },
    undefined,
    apiMode.auth
  );
}

// 🔹 Confirm Email
export async function confirmEmailApi(email: string, token: string) {
  return await apiCall<any>(
    `/Authentication/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
    { method: "GET" },
    undefined,
    apiMode.auth
  );
}

// 🔹 Resend confirmation email
export async function resendConfirmationEmailApi(email: string) {
  return await apiCall<any>(
    `/Authentication/ReSent?email=${encodeURIComponent(email)}`,
    { method: "GET" },
    undefined,
    apiMode.auth
  );
}

// 🔹 Forget Password
export async function forgetPasswordApi(email: string): Promise<boolean> {
  return await apiCall<boolean>(
    `/Authentication/forget-password`,
    { method: "POST", body: JSON.stringify({ email }) },
    undefined,
    apiMode.auth
  );
}

// 🔹 Save New Password
export async function saveNewPasswordApi(data: {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<boolean> {
  return await apiCall<boolean>(
    `/Authentication/save-new-password`,
    { method: "POST", body: JSON.stringify(data) },
    undefined,
    apiMode.auth
  );
}

// 🔹 Change Password
export async function changePasswordApi(email: string, oldPassword: string, password: string, confirmPassword: string) {
  return await apiCall<any>(
    `/Authentication/change-password/${encodeURIComponent(email)}`,
    {
      method: "POST",
      body: JSON.stringify({ oldPassword, password, confirmPassword }),
    },
    undefined,
    apiMode.auth
  );
}


// -------------------- Shipments (Orders) API --------------------
export const shipmentsAPI = {
  // ✅ Get all orders
  getAll: async (): Promise<OrderResponse[]> => {
    return apiCall<OrderResponse[]>(`/Order`);
  },
  getAllZonesForSeller: async (): Promise<ZonesForSellerResponse[]> => {
    return apiCall<ZonesForSellerResponse[]>("/Order/Zones");
  },

  // ✅ Get by ID *********
  getById: async (id: string): Promise<OrderResponseDetails | Partial<OrderResponseDetails>> => {
    if (!id) {
      throw new Error(`Invalid ID ${id}`);
    }
    return apiCall<OrderResponseDetails | Partial<OrderResponseDetails>>(`/Order/${id}`);
  },

  // ✅ Create new order (with notification)
  // api.ts
  create: async (data: Partial<OrderRequest>): Promise<OrderResponse> => {
    return apiCall<OrderResponse>("/Order", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  createForSeller: async (data: Partial<OrderRequestSeller>): Promise<OrderResponse> => {
    return apiCall<OrderResponse>("/Order", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  // create: async (data: Partial<OrderRequest>): Promise<OrderResponse> => {
  //   return apiCall<OrderResponse>("/Order", {
  //     method: "POST",
  //     body: JSON.stringify(data),
  //   });
  // },

  // ✅ Update existing order
  update: async (
    id: string,
    data: Partial<OrderUpdate>
  ): Promise<OrderRequest> => {
    return apiCall<OrderRequest>(`/Order/${id}`, {
      method: "POST",
      body: JSON.stringify({ ...data }),
    });
  },
  updateForSeller: async (
    id: string,
    data: Partial<OrderUpdateSeller>
  ): Promise<OrderRequest> => {
    return apiCall<OrderRequest>(`/Order/${id}`, {
      method: "POST",
      body: JSON.stringify({ ...data }),
    });
  },

  // ✅ Update status
  updateStatus: async (
    id: string,
    status: string,
    notes?: string
  ): Promise<Shipment> => {
    return apiCall<Shipment>(`/Order/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  },

  // ✅ Bulk status update
  bulkUpdateStatus: async (
    data: ChangeSateOrdersRequest
  ): Promise<void> => {
    // Convert status from string key (e.g. "New") to enum value (e.g. "0") if needed
    const statusKey = data.statusOrder as unknown as keyof typeof ShipmentStatus;
    const statusValue = ShipmentStatus[statusKey];
    const finalStatus = statusValue !== undefined ? statusValue : data.statusOrder;

    return apiCall<void>("/Order/ChangeSatuseOrders", {
      method: "PATCH",
      body: JSON.stringify({
        ...data, statusOrder: parseInt(finalStatus)
      }),
    });
  },

  // ✅ Assign agent
  assign: async (id: string, agentId: string): Promise<Shipment> => {
    return apiCall<Shipment>(`/Order/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ agentId }),
    });
  },

  // ✅ Bulk assign
  bulkAssign: async (ids: string[], agentId: string): Promise<void> => {
    return apiCall<void>("/Order/bulk-assign", {
      method: "PATCH",
      body: JSON.stringify({ shipmentIds: ids, agentId }),
    });
  },

  // ✅ Hide / Unhide
  hide: async (id: string, hidden: boolean): Promise<Shipment> => {
    return apiCall<Shipment>(`/Order/${id}/hide`, {
      method: "PATCH",
      body: JSON.stringify({ hidden }),
    });
  },

  // ✅ Delete
  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/Order/${id}`, { method: "DELETE" });
  },

  // ✅ Stats
  getStats: async (filters?: {
    dateFrom?: string;
    dateTo?: string;
    sellerId?: string;
    agentId?: string;
  }) => {
    const query = new URLSearchParams(
      Object.entries(filters || {}).filter(([_, v]) => v !== undefined) as [
        string,
        string
      ][]
    );
    return apiCall<{
      total: number;
      inProgress: number;
      completed: number;
      revenue: number;
    }>(`/Order/stats?${query.toString()}`);
  },
};

// Wallet API
export const walletAPI = {
  // GET /api/wallet/summary - Get wallet summary (DONE)
  getSummary: async (): Promise<WalletSummary> => {
    // TODO: Replace with actual API call
    // return apiCall<WalletSummary>('/wallet/summary');

    const wallet = await apiCall<WalletSummary>("/Wallet");
    console.log(wallet);

    return wallet;

    // const { mockWalletSummary } = await import('../lib/mockData');
    // return mockWalletSummary;
  },

  // GET /api/wallet/transactions - Get transaction history
  // getTransactions: async (filters?: {
  //   type?: string;
  //   dateFrom?: string;
  //   dateTo?: string;
  //   page?: number;
  //   limit?: number;
  // }): Promise<{ data: Transaction[]; total: number }> => {
  // TODO: Replace with actual API call

  //   const { mockTransactions } = await import('../lib/mockData');
  //   return { data: mockTransactions, total: mockTransactions.length };
  // },

  // POST /api/wallet/withdraw - Request withdrawal
  // withdraw: async (amount: number, bankDetails: any): Promise<Transaction> => {
  //   // TODO: Replace with actual API call
  //   throw new Error('Not implemented - connect to backend');
  // },
};
// Agents API
export const agentsAPI = {
  // GET /api/agents - Get all agents
  getAll: async (): Promise<Agent[]> => {
    // TODO: Replace with actual API call to .NET backend

    return apiCall<Agent[]>('/Agent', {
      method: 'GET',
    });

    // const { mockAgents } = await import("../lib/mockData");
    // return mockAgents;
  },

  // GET /api/agents/:id - Get agent by ID
  getById: async (id: string): Promise<Agent> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<Agent>(`/Agent/${id}`, { method: 'GET', });
  },

  // POST /api/agents - Create new agent
  create: async (agentData: Partial<Agent>): Promise<Agent> => {
    // TODO: Replace with actual API call to .NET backend
    console.log(agentData)
    return apiCall<Agent>('/Agent/Add', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
    // console.log(agentData);

    // console.log("Backend API: Create agent", agentData);
    // throw new Error("Not implemented - connect to backend");
  },

  // PUT /api/Agent/Update - Update agent
  update: async (id: string, agentData: Partial<Agent>): Promise<Agent> => {
    // TODO: Replace with actual API call to .NET backend
    const dataToSend = { ...agentData, id };
    return apiCall<Agent>(`/Agent/Update`, {
      method: 'PUT',
      body: JSON.stringify(dataToSend),
    });

    console.log("Backend API: Update agent", { id, agentData });
    throw new Error("Not implemented - connect to backend");
  },


  // DELETE /api/agents/:id - Delete agent
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    //  Endpoint  /Agent/{id}
    // return apiCall<void>(`/Agent/${id}`, {
    // method: 'DELETE',
    // });

    console.log("Backend API: Delete agent", id);
    throw new Error("Not implemented - connect to backend");
  },

  // PUT /api/Agent/Activation - Update agent status ( Activation endpoint)
  updateStatus: async (
    id: string,
    branchId: string,
  ): Promise<Agent> => {
    // TODO: Replace with actual API call to .NET backend
    // const isActivated = status === 'active';
    console.log(id, branchId);
    const params = new URLSearchParams({ id: id as string, branchId: branchId })
    return apiCall<Agent>(`/Agent/Activation?${params}`, {
      method: 'GET',
    });

    console.log("Backend API: Update agent status", { id, status });
    throw new Error("Not implemented - connect to backend");
  },

  // POST /api/Agent/SetDeactivationPeriod
  setDeactivationPeriod: async (id: string, fromDate: string | null, toDate: string | null): Promise<Agent> => {
    return apiCall<Agent>(`/Agent/SetDeactivationPeriod`, {
      method: 'POST',
      body: JSON.stringify({
        agentId: id,
        deactivationFrom: fromDate,
        deactivationTo: toDate
      }),
    });
  },

  // PUT /api/Agent/ToggleHidden
  toggleHidden: async (id: string, isHidden: boolean): Promise<Agent> => {
    return apiCall<Agent>(`/Agent/ToggleHidden`, {
      method: 'PUT',
      body: JSON.stringify({ agentId: id, isHidden: isHidden }),
    });
  },
};
// Sellers API
export const sellersAPI = {
  // GET /api/sellers - Get all sellers (done)
  getAll: async (): Promise<Seller[]> => {
    // TODO: Replace with actual API call to .NET backend
    return await apiCall<Seller[]>("/Seller/all");
    // const { mockSellers } = await import('../lib/mockData');
    // return mockSellers;
  },

  // GET /api/sellers/:id - Get seller by ID
  getById: async (id: string): Promise<Seller> => {
    // TODO: Replace with actual API call to .NET backend
    return await apiCall<Seller>(`/Seller/${id}`);
    // const { mockSellers } = await import('../lib/mockData');
    // const seller = mockSellers.find(s => s.id === id);
    // if (!seller) throw new Error('Seller not found');
    // return seller;
  },

  // POST /api/sellers - Create new seller
  create: async (sellerData: Partial<Seller>): Promise<Seller> => {
    // TODO: Replace with actual API call to .NET backend
    console.log(sellerData);
    return await apiCall<Seller>("/Seller/add", {
      method: "POST",
      body: JSON.stringify(sellerData),
    });

    // const newSeller = { id: Date.now().toString(), ...sellerData } as Seller;
    // return newSeller;
    // console.log('Backend API: Create seller', sellerData);
    // throw new Error('Not implemented - connect to backend');
  },

  // PUT /api/sellers/:id - Update seller
  update: async (id: string, sellerData: Partial<Seller>): Promise<Seller> => {
    // TODO: Replace with actual API call to .NET backend
    return await apiCall<Seller>(`/Seller/${id}`, {
      method: "PUT",
      body: JSON.stringify(sellerData),
    });
    // console.log('Backend API: Update seller', { id, sellerData });
    // throw new Error('Not implemented - connect to backend');
  },

  // DELETE /api/sellers/:id - Delete seller
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    console.log("Backend API: Delete seller", id);
    throw new Error("Not implemented - connect to backend");
  },

  // PATCH /api/sellers/:id/status - Update seller status
  updateStatus: async (
    id: string,
    status: "active" | "inactive",
    vip: string
  ): Promise<Boolean> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<Boolean>(`/Seller/activation?=${id}${vip ? "&vip=true" : ""}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });

    // Mock implementation
    // await new Promise((resolve) => setTimeout(resolve, 300));
    // const { mockSellers } = await import("../lib/mockData");
    // const seller = mockSellers.find((s) => s.id === id);
    // if (!seller) throw new Error("Seller not found");
    // seller.status = status;
    // return seller;
  },

  // POST /api/sellers/:id/deactivation-period - Set deactivation period
  setDeactivationPeriod: async (
    id: string,
    fromDate: string,
    toDate: string
  ): Promise<Seller> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<Seller>(`/sellers/${id}/deactivation-period`, {
    //   method: 'POST',
    //   body: JSON.stringify({ fromDate, toDate }),
    // });

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
    const { mockSellers } = await import("../lib/mockData");
    const seller = mockSellers.find((s) => s.id === id);
    if (!seller) throw new Error("Seller not found");
    seller.deactivationFrom = fromDate;
    seller.deactivationTo = toDate;
    return seller;
  },

  // GET /api/Seller/lockout/all
  getHiddenSellers: async (): Promise<Seller[]> => {
    return await apiCall<Seller[]>("/Seller/lockout/all");
  },

  // GET /api/Seller/active-count
  getActiveCount: async (): Promise<number> => {
    const res = await apiCall<{ count: number }>("/Seller/active-count");
    return res.count;
  },

  // GET /api/Seller/total-count
  getTotalCount: async (): Promise<number> => {
    const res = await apiCall<{ count: number }>("/Seller/total-count");
    return res.count;
  },

  // DELETE /api/sellers/:id/deactivation-period - Clear deactivation period
  clearDeactivationPeriod: async (id: string): Promise<Seller> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<Seller>(`/sellers/${id}/deactivation-period`, {
    //   method: 'DELETE',
    // });

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));

    const { mockSellers } = await import("../lib/mockData");
    const seller = mockSellers.find((s) => s.id === id);
    if (!seller) throw new Error("Seller not found");

    delete seller.deactivationFrom;
    delete seller.deactivationTo;
    return seller;
  },
};

// Branches API
export const branchesAPI = {
  // GET /api/branches - Get all branches
  getAll: async (): Promise<BranchResponse> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<BranchResponse>("/Branch");

    // const { mockBranches } = await import('../lib/mockData');
    // return mockBranches;
  },

  // GET /api/branches/:id - Get branch by ID
  getById: async (id: string): Promise<BranchResponseDetails> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<BranchResponseDetails>(`/Branch/${id}`);


  },

  // POST /api/branches - Create new branch
  create: async (branchData: Partial<NewBranchRequest>): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<void>("/Branch", {
      method: "POST",
      body: JSON.stringify(branchData),
    });

    console.log("Backend API: Create branch", branchData);
    throw new Error("Not implemented - connect to backend");
  },

  // PUT /api/branches/:id - Update branch
  update: async (
    id: string,
    branchData: Partial<BranchUpdate>
  ): Promise<BranchUpdate> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<BranchUpdate>(`/Branch/${id}`, {
      method: "PUT",
      body: JSON.stringify(branchData),
    });

    // console.log('Backend API: Update branch', { id, branchData });
    // throw new Error('Not implemented - connect to backend');
  },
  // PUT /api/Branch/{id}/activation/{isActive} - Toggle Branch Status
  toggleActivation: async (id: string, isActive: boolean): Promise<void> => {
    return apiCall<void>(`/Branch/activation/${isActive}`, {
      method: "PUT",
      body: JSON.stringify([id]),
    });
  },

  // DELETE /api/branches/:id - Delete branch
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>(`/branches/${id}`, {
    //   method: 'DELETE',
    // });

    console.log("Backend API: Delete branch", id);
    throw new Error("Not implemented - connect to backend");
  },
};

// Zones API
export const zonesAPI = {
  // GET /api/Zone - Get all zones
  getAll: async (): Promise<ZoneResponse[]> => {
    return apiCall<ZoneResponse[]>("/Zone");
  },

  getAllRegionCount: async (): Promise<number> => {
    return apiCall<number>("/Zone/totalRegoin");
  },

  // GET /api/Zone/{id} - Get zone by ID
  getById: async (id: number): Promise<ZoneResponseDetails> => {
    return apiCall<ZoneResponseDetails>(`/Zone/${id}`);
  },

  // POST /api/Zone - Create new zone
  // backend expects:  { zoneRequest: { name, regions[], branchId[] } }
  create: async (payload: ZoneRequest): Promise<ZoneResponseDetails> => {
    return apiCall<ZoneResponseDetails>("/Zone", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // PUT /api/Zone/{id} - Update zone
  update: async (id: number, payload: ZoneUpdate): Promise<void> => {
    return apiCall<void>(`/Zone/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // DELETE /api/zones/:id - Delete zone
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>(`/zones/${id}`, {
    //   method: 'DELETE',
    // });

    console.log("Backend API: Delete zone", id);
    throw new Error("Not implemented - connect to backend");
  },
};

// Users API
export const usersAPI = {
  // GET /Admin - Get all users
  getAll: async (): Promise<User[]> => {
    return apiCall<User[]>(`/Admin`, {
      method: 'GET',
    });
  },


  // GET /api/users/:id - Get user by ID
  getById: async (_id: string): Promise<any> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<any>(`/users/${id}`);

    throw new Error("Not implemented - connect to backend");
  },

  // POST /api/users - Create new user
  create: async (userData: any): Promise<any> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<any>('/Admin', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log("Backend API: Create user", userData);
    throw new Error("Not implemented - connect to backend");
  },

  // PUT /api/users/:id - Update user
  update: async (id: string, userData: any): Promise<any> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<any>(`/Admin`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    console.log("Backend API: Update user", { id, userData });
    throw new Error("Not implemented - connect to backend");
  },

  // DELETE /api/users/:id - Delete user
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>(`/users/${id}`, {
    //   method: 'DELETE',
    // });

    console.log("Backend API: Delete user", id);
    throw new Error("Not implemented - connect to backend");
  },

  // PATCH /api/users/:id/status - Update user status
  updateStatus: async (
    id: string,
    status: "active" | "inactive"
  ): Promise<any> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<any>(`/Admin/lockout/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });

    console.log("Backend API: Update user status", { id, status });
    throw new Error("Not implemented - connect to backend");
  },

  // GET /api/users/profile - Get current user profile
  getProfile: async (): Promise<any> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<any>('/users/profile');

    throw new Error("Not implemented - connect to backend");
  },

  // PUT /api/users/profile - Update current user profile
  updateProfile: async (profileData: any): Promise<any> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<any>('/users/profile', {
    //   method: 'PUT',
    //   body: JSON.stringify(profileData),
    // });

    console.log("Backend API: Update profile", profileData);
    throw new Error("Not implemented - connect to backend");
  },

  // PUT /api/users/password - Change password
  changePassword: async (
    _oldPassword: string,
    _newPassword: string
  ): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>('/users/password', {
    //   method: 'PUT',
    //   body: JSON.stringify({ oldPassword, newPassword }),
    // });

    console.log("Backend API: Change password");
    throw new Error("Not implemented - connect to backend");
  },
};

// Auth API
export const authAPI = {
  // POST /api/auth/login - User login
  login: async (
    email: string,
    password: string
  ): Promise<{ token: string; user: any }> => {
    // TODO: Replace with actual API call to .NET backend
    return apiCall<{ token: string; user: any }>("/Authentication/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    console.log("Backend API: Login", email);
    throw new Error("Not implemented - connect to backend");
  },

  // POST /api/auth/logout - User logout
  logout: async (): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>('/auth/logout', {
    //   method: 'POST',
    // });

    console.log("Backend API: Logout");
  },

  // POST /api/auth/refresh - Refresh token
  refreshToken: async (_refreshToken: string): Promise<{ token: string }> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<{ token: string }>('/auth/refresh', {
    //   method: 'POST',
    //   body: JSON.stringify({ refreshToken }),
    // });

    throw new Error("Not implemented - connect to backend");
  },

  // POST /api/auth/forgot-password - Request password reset
  forgotPassword: async (email: string): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>('/auth/forgot-password', {
    //   method: 'POST',
    //   body: JSON.stringify({ email }),
    // });

    console.log("Backend API: Forgot password", email);
    throw new Error("Not implemented - connect to backend");
  },

  // POST /api/auth/reset-password - Reset password with token
  resetPassword: async (_token: string, _newPassword: string): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>('/auth/reset-password', {
    //   method: 'POST',
    //   body: JSON.stringify({ token, newPassword }),
    // });

    console.log("Backend API: Reset password");
    throw new Error("Not implemented - connect to backend");
  },
};

// Reports API
export const reportsAPI = {
  // GET /api/reports/sales - Get sales report
  getSalesReport: async (filters: {
    dateFrom: string;
    dateTo: string;
    sellerId?: string;
    agentId?: string;
    status?: string;
  }): Promise<any> => {
    // TODO: Replace with actual API call to .NET backend
    // const queryParams = new URLSearchParams(
    //   Object.entries(filters).filter(([_, v]) => v !== undefined) as [string, string][]
    // );
    // return apiCall<any>(`/reports/sales?${queryParams.toString()}`);

    console.log("Backend API: Get sales report", filters);
    throw new Error("Not implemented - connect to backend");
  },

  // GET /api/reports/performance - Get performance report
  getPerformanceReport: async (filters: {
    dateFrom: string;
    dateTo: string;
    agentId?: string;
  }): Promise<any> => {
    // TODO: Replace with actual API call to .NET backend
    // const queryParams = new URLSearchParams(
    //   Object.entries(filters).filter(([_, v]) => v !== undefined) as [string, string][]
    // );
    // return apiCall<any>(`/reports/performance?${queryParams.toString()}`);

    console.log("Backend API: Get performance report", filters);
    throw new Error("Not implemented - connect to backend");
  },

  // GET /api/reports/export - Export report
  exportReport: async (reportType: string, filters: any): Promise<Blob> => {
    // TODO: Replace with actual API call to .NET backend
    // const queryParams = new URLSearchParams({
    //   type: reportType,
    //   ...Object.entries(filters).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
    // });
    // const response = await fetch(`${API_BASE_URL}/reports/export?${queryParams.toString()}`, {
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //   },
    // });
    // return await response.blob();

    console.log("Backend API: Export report", { reportType, filters });
    throw new Error("Not implemented - connect to backend");
  },
};

// Notifications API
export const notificationsAPI = {
  // GET /api/notifications - Get all notifications for the current user
  getAll: async (): Promise<any[]> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<any[]>('/notifications');

    // Mock response - notifications will be managed in context
    return [];
  },

  // GET /api/notifications/unread-count - Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<{ count: number }>('/notifications/unread-count').then(r => r.count);

    return 0;
  },

  // GET /api/notifications/new-orders-count - Get count of new orders (for admin sidebar)
  getNewOrdersCount: async (): Promise<number> => {
    // TODO: Replace with actual API call to .NET backend
    // This should return the count of orders with "new" status that haven't been actioned
    // return apiCall<{ count: number }>('/notifications/new-orders-count').then(r => r.count);

    // Mock implementation
    return 0;
  },

  // POST /api/notifications/order-created - Create notification when order is created
  notifyOrderCreated: async (data: {
    orderId: string;
    orderNumber: string;
    sellerName: string;
    sellerId: string;
  }): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // This will create a notification for admins when a seller creates an order
    // return apiCall<void>('/notifications/order-created', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });

    console.log("Backend API: Order created notification", data);
  },

  // POST /api/notifications/order-assigned - Create notification when order is assigned to agent
  notifyOrderAssigned: async (data: {
    orderId: string;
    orderNumber: string;
    agentId: string;
    agentName: string;
  }): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // This will create a notification for the agent when an order is assigned to them
    // return apiCall<void>('/notifications/order-assigned', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });

    console.log("Backend API: Order assigned notification", data);
  },

  // POST /api/notifications/status-changed - Create notification when order status changes
  notifyStatusChanged: async (data: {
    orderId: string;
    orderNumber: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    changedById: string;
    sellerId?: string; // Optional: Notify specific seller
  }): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // This will create notifications for admin and seller when status changes
    // return apiCall<void>('/notifications/status-changed', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });

    console.log("Backend API: Status changed notification", data);
  },

  // PATCH /api/notifications/:id/read - Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>(`/notifications/${id}/read`, {
    //   method: 'PATCH',
    // });

    console.log("Backend API: Mark notification as read", id);
  },

  // PATCH /api/notifications/mark-all-read - Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>('/notifications/mark-all-read', {
    //   method: 'PATCH',
    // });

    console.log("Backend API: Mark all notifications as read");
  },

  // DELETE /api/notifications/clear - Clear all notifications
  clearAll: async (): Promise<void> => {
    // TODO: Replace with actual API call to .NET backend
    // return apiCall<void>('/notifications/clear', {
    //   method: 'DELETE',
    // });

    console.log("Backend API: Clear all notifications");
  },
};
// Generic API call function
// dashboard
export const log = {
  // GET /api/branches - Get all branches
  getAll: async (): Promise<Activity[]> => {
    // TODO: Replace with actual API call to .NET backend
    // console.log("Fetching log activities from backend...");
    console.log(log)
    return apiCall<Activity[]>("/Log");
    

    // const { mockBranches } = await import('../lib/mockData');
    // return mockBranches;
  },
};
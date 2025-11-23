import React, { useState } from "react";
import { motion } from "motion/react";
import { Package, Mail, Lock, Loader2, Phone, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { agentRegisterApi, sellerRegisterApi } from "../services/api";
import { useNavigate } from "react-router-dom";

export function SignUpPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"Agent" | "Seller">("Agent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmed, setPasswordConfirmed] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [branchId, setBranchId] = useState<number | "">("");

  // Seller specific
  const [storeName, setStoreName] = useState("");

  const handleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      if (role === "Agent") {
        if (password !== passwordConfirmed) {
          setError("Passwords do not match!");
          setLoading(false);
          return;
        }

        await agentRegisterApi({
          email,
          password,
          passwordConfirmed,
          userName,
          phoneNumber,
          address,
          branchId,
        });
      } else {
        await sellerRegisterApi({
          storeName,
          email,
          password,
          passwordConfirmed,
          userName,
          phoneNumber,
          address,
          branchId,
        });
      }

      alert("Account created! Please login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Package className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl">Circle Code</CardTitle>
              <CardDescription>Sign up to create your account</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Role Selector */}
            <div className="flex justify-center mb-4 space-x-2">
              <Button
                variant={role === "Agent" ? "default" : "outline"}
                onClick={() => setRole("Agent")}
              >
                Agent
              </Button>
              <Button
                variant={role === "Seller" ? "default" : "outline"}
                onClick={() => setRole("Seller")}
              >
                Seller
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              {role === "Seller" && (
                <div>
                  <Label>Store Name</Label>
                  <Input
                    placeholder="Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="pl-2"
                    required
                  />
                </div>
              )}

              <div>
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="your.email@circlecode.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Username</Label>
                <Input
                  placeholder="Username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {role === "Agent" && (
                <div>
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={passwordConfirmed}
                      onChange={(e) => setPasswordConfirmed(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Branch ID</Label>
                <Input
                  type="number"
                  placeholder="Branch ID"
                  value={branchId}
                 onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : "")}
                  required
                />
              </div>
            </div>

            <Button
              onClick={handleSignUp}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

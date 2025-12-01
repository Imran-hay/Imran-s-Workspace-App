"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "@/lib/auth-client";
import { REDIRECT_STORAGE_KEY } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { organizationService } from "@/lib/services/organization-services";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
          const url = localStorage.getItem(REDIRECT_STORAGE_KEY);
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: url || "/dashboard",
      });

      if (error) {
       
          setMessage(error.message || "Failed to sign in.");
        
      }
      else
      {
        localStorage.removeItem(REDIRECT_STORAGE_KEY);
           try {
                  const {
                    data: organizations = [],
                    isLoading,
                    isError,
                    error: queryError
                  } = useQuery({
                    queryKey: ['organizations'],
                    queryFn: async () => {
                      const data = await organizationService.getUserOrganizations();
                      
                      if (!data) {
                        throw new Error("Failed to load organizations");
                      }
                      
                      return data || [];
                    },
                    retry: 1,
                  });
       
        
     
      } catch (orgError) {
       
        console.error("Failed to fetch organization:", orgError);
        router.push("/dashboard");
      }
      }
     
    } catch (err) {
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
  <Card className="w-full max-w-md">
    <CardHeader className="text-center">
      <CardTitle className="text-xl font-bold">Sign In</CardTitle>
      <CardDescription>
        Enter your email and password to continue
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <Alert variant={"destructive"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="text-center text-sm text-gray-600">
          Need an account?{" "}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </div>
      </form>
    </CardContent>
  </Card>
</div>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function VerifiedEmail() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Email verified</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Your email has been verified. You can now sign in.
                    </p>
                    <Button onClick={() => router.push("/sign-in")} className="w-full">
                        Go to sign in
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

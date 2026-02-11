"use client"

import { useSession } from "next-auth/react";
import PreparingForm from "./preparing-form";
import { Button } from "../../ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { updateOnboarding } from "@/services/firebase/update";
import { Loader2Icon } from "lucide-react";

const OnboardingForm = () => {
    const { data: session, status } = useSession();
    const toastShownRef = useRef(false);

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [stage, setStage] = useState(0);

    // Stage 0: User info
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");

    // Stage 1: Org action choice
    const [orgAction, setOrgAction] = useState<"create" | "join" | "skip">("create")
    // Create
    const [orgName, setOrgName] = useState("");
    // Join
    const [joinCode, setJoinCode] = useState("")

    const handleNextStage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (stage === 0 && (!firstname || !lastname)) {
            toast.error("Please enter your first and last name.");
            return;
        }

        setLoading(true);

        await updateOnboarding({
            firstname,
            lastname
        })
        toast.success("Account created and onboarding complete!")

        router.push(`/preparing`);
    };

    useEffect(() => {
        if (toastShownRef.current) return;

        if (status === "loading") {
            toast.info("Checking your session...");
        } else if (status === "unauthenticated") {
            toast.warning("You are not authenticated.");
        } else if (status === "authenticated") {
            toast.success(`Welcome to your onboarding`);
        }
        toastShownRef.current = true;

    }, [status, session,]);

    async function onClick() {
        router.push("/login")
    }

    const handlePreviousStage = () => {
        setStage((prev) => Math.max(prev - 1, 0));
    };

    if (status === "loading") {
        return <PreparingForm />
    }

    if (status === "unauthenticated") {
        return (
            <div className="text-center mb-6 space-y-6">
                <h1 className="text-4xl font-bold mb-6">Not authenticated</h1>
                <p>Please login or create an account</p>
                <Button onClick={onClick}>
                    Go to login
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto p-6 text-center">
            {stage === 0 && (
                <form onSubmit={handleNextStage} className="space-y-6">
                    <h1 className="text-2xl font-bold ">Let&apos;s get started</h1>
                    <div className="space-y-4">
                        <div className="grid gap-3">
                            <Label htmlFor="firstname">First Name</Label>
                            <Input id="firstname" value={firstname} type="text" placeholder="John" required onChange={(e) => setFirstname(e.target.value)} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="lastname">Last Name</Label>
                            <Input id="lastname" value={lastname} type="text" placeholder="Smith" required onChange={(e) => setLastname(e.target.value)} />
                        </div>
                    </div>
                    <Button className="w-full mt-4" type="submit" disabled={!firstname || !lastname}>
                        Continue
                    </Button>
                </form>
            )}

            {stage === 1 && (
                <form onSubmit={handleNextStage} className="space-y-6">
                    <h1 className="text-2xl font-bold mb-4">Organisation</h1>

                    {/* Action toggle */}
                    <div className="flex space-x-4 justify-center">
                        <Button
                            variant={orgAction === "create" ? "default" : "ghost"}
                            onClick={() => setOrgAction("create")}
                        >
                            Create New
                        </Button>
                        <Button
                            variant={orgAction === "join" ? "default" : "ghost"}
                            onClick={() => setOrgAction("join")}
                        >
                            Join Existing
                        </Button>
                    </div>

                    {orgAction === "create" ? (
                        <div className="space-y-4">
                            <div className="grid gap-3">
                                <Label htmlFor="organisation">Organisation Name</Label>
                                <Input
                                    id="organisation"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="Karsilo Inc."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-3">
                                <Label htmlFor="joinCode">Join Code</Label>
                                <Input
                                    id="joinCode"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder="e.g. AbCd1234"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <Button variant="link" onClick={handlePreviousStage}>
                            Go Back
                        </Button>
                        <Button className="w-32" type="submit" disabled={loading}>
                            {(loading && (orgAction === "create" || orgAction === "join")) && <Loader2Icon className="animate-spin" />}
                            {(loading && (orgAction === "create" || orgAction === "join")) ? orgAction === "create" ? "Creating" : "Joining" : orgAction === "create" ? "Create" : "Join"}
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="link" onClick={() => setOrgAction("skip")}>
                            {(loading && orgAction === "skip") && <Loader2Icon className="animate-spin" />}
                            Skip for now
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default OnboardingForm

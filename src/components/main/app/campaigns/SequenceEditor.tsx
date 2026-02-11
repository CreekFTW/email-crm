"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, Mail } from "lucide-react";
import type { CampaignSequenceStep } from "@/types/campaign";

interface SequenceEditorProps {
    sequences: CampaignSequenceStep[];
    onChange: (sequences: CampaignSequenceStep[]) => void;
}

const DEFAULT_STEP: CampaignSequenceStep = {
    subject: "",
    body: "",
    delay: 0,
};

export default function SequenceEditor({ sequences, onChange }: SequenceEditorProps) {
    const addStep = () => {
        const newDelay = sequences.length === 0 ? 0 : 3; // First email has no delay, follow-ups default to 3 days
        onChange([...sequences, { ...DEFAULT_STEP, delay: newDelay }]);
    };

    const removeStep = (index: number) => {
        onChange(sequences.filter((_, i) => i !== index));
    };

    const updateStep = (index: number, updates: Partial<CampaignSequenceStep>) => {
        const newSequences = [...sequences];
        newSequences[index] = { ...newSequences[index], ...updates };
        onChange(newSequences);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label>Email Sequences</Label>
                    <p className="text-xs text-muted-foreground">
                        Create your email sequence with follow-ups
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={addStep}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Email
                </Button>
            </div>

            {sequences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No emails in sequence</p>
                    <Button variant="outline" size="sm" onClick={addStep} className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Email
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {sequences.map((step, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium text-sm">
                                        {index === 0 ? "Initial Email" : `Follow-up ${index}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {index > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Label className="text-xs">Delay:</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={30}
                                                value={step.delay || 1}
                                                onChange={(e) =>
                                                    updateStep(index, {
                                                        delay: parseInt(e.target.value) || 1,
                                                    })
                                                }
                                                className="w-16 h-8"
                                            />
                                            <span className="text-xs text-muted-foreground">days</span>
                                        </div>
                                    )}
                                    {sequences.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeStep(index)}
                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs">Subject Line</Label>
                                <Input
                                    value={step.subject}
                                    onChange={(e) => updateStep(index, { subject: e.target.value })}
                                    placeholder="Enter email subject..."
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Use {"{{first_name}}"} for personalization
                                </p>
                            </div>

                            <div>
                                <Label className="text-xs">Email Body</Label>
                                <Textarea
                                    value={step.body}
                                    onChange={(e) => updateStep(index, { body: e.target.value })}
                                    placeholder="Enter email content..."
                                    rows={6}
                                    className="mt-1 font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Variables: {"{{first_name}}"}, {"{{last_name}}"}, {"{{company_name}}"}, {"{{title}}"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {sequences.length > 0 && (
                <Button variant="outline" size="sm" onClick={addStep} className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Follow-up Email
                </Button>
            )}
        </div>
    );
}

"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { CampaignSchedule, CampaignScheduleSlot } from "@/types/campaign";
import { cn } from "@/lib/utils";

interface ScheduleBuilderProps {
    schedule: CampaignSchedule;
    onChange: (schedule: CampaignSchedule) => void;
}

const DAYS = [
    { key: "sun", label: "S" },
    { key: "mon", label: "M" },
    { key: "tue", label: "T" },
    { key: "wed", label: "W" },
    { key: "thu", label: "T" },
    { key: "fri", label: "F" },
    { key: "sat", label: "S" },
];

const TIMEZONES = [
    { value: "America/New_York", label: "Eastern (ET)" },
    { value: "America/Chicago", label: "Central (CT)" },
    { value: "America/Denver", label: "Mountain (MT)" },
    { value: "America/Los_Angeles", label: "Pacific (PT)" },
    { value: "America/Phoenix", label: "Arizona (AZ)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Asia/Singapore", label: "Singapore (SGT)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
    { value: "UTC", label: "UTC" },
];

const DEFAULT_SLOT: CampaignScheduleSlot = {
    name: "Schedule",
    timing: { from: "09:00", to: "17:00" },
    days: {
        sun: false,
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: false,
    },
    timezone: "America/New_York",
};

export default function ScheduleBuilder({ schedule, onChange }: ScheduleBuilderProps) {
    const schedules = schedule?.schedules || [];

    const addSlot = () => {
        onChange({
            schedules: [
                ...schedules,
                { ...DEFAULT_SLOT, name: `Schedule ${schedules.length + 1}` },
            ],
        });
    };

    const removeSlot = (index: number) => {
        onChange({
            schedules: schedules.filter((_, i) => i !== index),
        });
    };

    const updateSlot = (index: number, updates: Partial<CampaignScheduleSlot>) => {
        const newSchedules = [...schedules];
        newSchedules[index] = { ...newSchedules[index], ...updates };
        onChange({ schedules: newSchedules });
    };

    const toggleDay = (slotIndex: number, day: string) => {
        const slot = schedules[slotIndex];
        updateSlot(slotIndex, {
            days: {
                ...slot.days,
                [day]: !slot.days[day],
            },
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label>Send Schedule</Label>
                    <p className="text-xs text-muted-foreground">
                        Define when emails should be sent
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={addSlot}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Schedule
                </Button>
            </div>

            {schedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <p>No schedules defined</p>
                    <Button variant="outline" size="sm" onClick={addSlot} className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Schedule
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {schedules.map((slot, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <Input
                                    value={slot.name}
                                    onChange={(e) => updateSlot(index, { name: e.target.value })}
                                    placeholder="Schedule name"
                                    className="w-48"
                                />
                                {schedules.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSlot(index)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Time Range */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <Label className="text-xs">From</Label>
                                    <Input
                                        type="time"
                                        value={slot.timing.from}
                                        onChange={(e) =>
                                            updateSlot(index, {
                                                timing: { ...slot.timing, from: e.target.value },
                                            })
                                        }
                                        className="w-32"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">To</Label>
                                    <Input
                                        type="time"
                                        value={slot.timing.to}
                                        onChange={(e) =>
                                            updateSlot(index, {
                                                timing: { ...slot.timing, to: e.target.value },
                                            })
                                        }
                                        className="w-32"
                                    />
                                </div>
                            </div>

                            {/* Days */}
                            <div>
                                <Label className="text-xs mb-2 block">Days</Label>
                                <div className="flex gap-1">
                                    {DAYS.map((day) => (
                                        <button
                                            key={day.key}
                                            type="button"
                                            onClick={() => toggleDay(index, day.key)}
                                            className={cn(
                                                "w-8 h-8 rounded-full text-xs font-medium transition-colors",
                                                slot.days[day.key]
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            )}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Timezone */}
                            <div>
                                <Label className="text-xs mb-1 block">Timezone</Label>
                                <Select
                                    value={slot.timezone}
                                    onValueChange={(value) => updateSlot(index, { timezone: value })}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIMEZONES.map((tz) => (
                                            <SelectItem key={tz.value} value={tz.value}>
                                                {tz.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

import type {
    CreateCampaignRequest,
    CampaignSchedule,
    CampaignSequenceStep,
} from "@/types/campaign";

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

/**
 * Validate campaign name
 */
export function validateCampaignName(name: string | undefined): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!name || name.trim().length === 0) {
        errors.push({
            field: "name",
            message: "Campaign name is required",
        });
    } else if (name.trim().length < 3) {
        errors.push({
            field: "name",
            message: "Campaign name must be at least 3 characters",
        });
    } else if (name.trim().length > 100) {
        errors.push({
            field: "name",
            message: "Campaign name must be less than 100 characters",
        });
    }

    return errors;
}

/**
 * Validate campaign schedule
 */
export function validateSchedule(schedule: CampaignSchedule | undefined): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!schedule || !schedule.schedules || schedule.schedules.length === 0) {
        errors.push({
            field: "campaign_schedule",
            message: "At least one schedule is required",
        });
        return errors;
    }

    schedule.schedules.forEach((slot, index) => {
        // Validate time range
        if (!slot.timing?.from || !slot.timing?.to) {
            errors.push({
                field: `campaign_schedule.schedules[${index}].timing`,
                message: `Schedule ${index + 1}: Start and end times are required`,
            });
        } else {
            const fromTime = slot.timing.from.split(":").map(Number);
            const toTime = slot.timing.to.split(":").map(Number);
            const fromMinutes = fromTime[0] * 60 + fromTime[1];
            const toMinutes = toTime[0] * 60 + toTime[1];

            if (fromMinutes >= toMinutes) {
                errors.push({
                    field: `campaign_schedule.schedules[${index}].timing`,
                    message: `Schedule ${index + 1}: End time must be after start time`,
                });
            }
        }

        // Validate days
        if (!slot.days || !Object.values(slot.days).some(Boolean)) {
            errors.push({
                field: `campaign_schedule.schedules[${index}].days`,
                message: `Schedule ${index + 1}: At least one day must be selected`,
            });
        }

        // Validate timezone
        if (!slot.timezone) {
            errors.push({
                field: `campaign_schedule.schedules[${index}].timezone`,
                message: `Schedule ${index + 1}: Timezone is required`,
            });
        }
    });

    return errors;
}

/**
 * Validate email sequences
 */
export function validateSequences(sequences: CampaignSequenceStep[] | undefined): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!sequences || sequences.length === 0) {
        errors.push({
            field: "sequences",
            message: "At least one email sequence is required",
        });
        return errors;
    }

    sequences.forEach((step, index) => {
        const stepLabel = index === 0 ? "Initial email" : `Follow-up ${index}`;

        if (!step.subject || step.subject.trim().length === 0) {
            errors.push({
                field: `sequences[${index}].subject`,
                message: `${stepLabel}: Subject line is required`,
            });
        } else if (step.subject.length > 200) {
            errors.push({
                field: `sequences[${index}].subject`,
                message: `${stepLabel}: Subject line must be less than 200 characters`,
            });
        }

        if (!step.body || step.body.trim().length === 0) {
            errors.push({
                field: `sequences[${index}].body`,
                message: `${stepLabel}: Email body is required`,
            });
        }

        if (index > 0) {
            if (step.delay === undefined || step.delay < 1) {
                errors.push({
                    field: `sequences[${index}].delay`,
                    message: `${stepLabel}: Delay must be at least 1 day`,
                });
            } else if (step.delay > 30) {
                errors.push({
                    field: `sequences[${index}].delay`,
                    message: `${stepLabel}: Delay cannot exceed 30 days`,
                });
            }
        }
    });

    return errors;
}

/**
 * Validate daily limit
 */
export function validateDailyLimit(limit: number | undefined): ValidationError[] {
    const errors: ValidationError[] = [];

    if (limit !== undefined) {
        if (limit < 1) {
            errors.push({
                field: "daily_limit",
                message: "Daily limit must be at least 1",
            });
        } else if (limit > 500) {
            errors.push({
                field: "daily_limit",
                message: "Daily limit cannot exceed 500",
            });
        }
    }

    return errors;
}

/**
 * Validate email list
 */
export function validateEmailList(emails: string[] | undefined): ValidationError[] {
    const errors: ValidationError[] = [];

    if (emails && emails.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        emails.forEach((email, index) => {
            if (!emailRegex.test(email)) {
                errors.push({
                    field: `email_list[${index}]`,
                    message: `Invalid email address: ${email}`,
                });
            }
        });
    }

    return errors;
}

/**
 * Validate entire campaign creation request
 */
export function validateCreateCampaignRequest(data: CreateCampaignRequest): ValidationResult {
    const errors: ValidationError[] = [
        ...validateCampaignName(data.name),
        ...validateSchedule(data.campaign_schedule),
        ...validateSequences(data.sequences),
        ...validateDailyLimit(data.daily_limit),
        ...validateEmailList(data.email_list),
    ];

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
    const error = errors.find((e) => e.field === field || e.field.startsWith(`${field}[`));
    return error?.message;
}

/**
 * Check if a field has an error
 */
export function hasFieldError(errors: ValidationError[], field: string): boolean {
    return errors.some((e) => e.field === field || e.field.startsWith(`${field}[`));
}

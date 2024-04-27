import { BASE_URL } from "~/constants";
import { z } from "zod";
import { asMap } from "./util";

// NOTE: added Accept-Encoding for SSR, should remove/update when fixed (undici bug in SSR)

const acceptEncoding = "";

const athleteValidator = z.object({
    id: z.coerce.number(),
    name: z.coerce.string().nullable(),
    country: z.coerce.string().nullable(),
    club: z.coerce.string().nullable(),
    birthdate: z.coerce.string().nullable()
});

export type Athlete = z.infer<typeof athleteValidator>;

export type Result<T> = {
    result: T,
    isRatelimit: boolean
}

export const genders = {
    "UNSPECIFIED": {
        ordinal: -1,
        displayName: "Niet gespecificeerd"
    },
    "MAN": {
        ordinal: 1,
        displayName: "Man"
    },
    "WOMAN": {
        ordinal: 2,
        displayName: "Vrouw"
    }
} as const;

export type Gender = keyof typeof genders

export async function search(firstName: string, lastName: string, gender: Gender, country: number): Promise<Result<Athlete[]> | null> {
    try {
        const res = await fetch(BASE_URL + "search", {
            method: "POST",
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                gender: gender,
                country: country
            }),
            headers: {
                "Content-Type": "application/json",
                "Accept-Encoding": acceptEncoding
            }
        });
        if (res.status == 429) return {
            result: [],
            isRatelimit: true
        };
        return {
            result: z.object({
                results: z.array(athleteValidator)
            }).parse(await res.json()).results,
            isRatelimit: false
        };
    } catch (e) {
        console.error("Error searching athletes", e);
        return null;
    }
}

export async function getCountries(): Promise<Result<Map<number, string>> | null> {
    try {
        const res = await fetch(BASE_URL + "countries", {
            headers: {
                "Accept-Encoding": acceptEncoding
            }
        });
        if (res.status == 429) return {
            result: new Map(),
            isRatelimit: true
        };
        return {
            result: asMap(z.record(z.coerce.number(), z.coerce.string()).parse(await res.json())),
            isRatelimit: false
        };
    } catch (e) {
        console.error("Error fetching countries", e);
        return null;
    }
}

const matchValidator = z.object({
    id: z.coerce.number(),
    name: z.coerce.string(),
    link: z.coerce.string()
});

export type Match = z.infer<typeof matchValidator>

const resultValidator = z.object({
    id: z.coerce.number(),
    rawValue: z.coerce.string(),
    link: z.coerce.string(),
    time: z.coerce.number()
});

export type RecordResult = z.infer<typeof resultValidator>

const eventValidator = z.object({
    id: z.coerce.number(),
    description: z.coerce.string(),
    link: z.coerce.string(),
    course: z.coerce.string()
});

export type Event = z.infer<typeof eventValidator>

const recordValidator = z.object({
    event: eventValidator,
    result: resultValidator,
    points: z.coerce.number().nullish(),
    date: z.coerce.string(),
    city: z.coerce.string(),
    match: matchValidator
});

export type Record = z.infer<typeof recordValidator>

const recordsValidator = z.object({
    athleteId: z.coerce.number(),
    results: z.array(recordValidator)
});

export type Records = z.infer<typeof recordsValidator>

export async function getAthlete(id: string): Promise<Result<Records | null> | null> {
    try {
        const res = await fetch(BASE_URL + "records/" + id, {
            headers: {
                "Accept-Encoding": acceptEncoding
            }
        });
        if (res.status == 429) return {
            result: null,
            isRatelimit: true
        };
        return {
            result: recordsValidator.parse(await res.json()),
            isRatelimit: false
        };
    } catch (e) {
        console.error(`Error fetching athlete ${id}`, e);
        return null;
    }
}

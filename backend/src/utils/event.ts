
import { google } from "googleapis";
import {generateID} from "../utils/helper";
import { credentials } from "./creadentials";


// @ts-ignore
const auth = new google.auth.JWT(credentials.client_email, null, credentials.private_key,
    [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
    ],
    'admin@jisrcareapp.com',
);


export const createEvent = async (emails:any , time:any) => {
    const calendar = google.calendar({ version: 'v3', auth });
    const meetId = generateID("MEET_ID", 20);
    const event = {
        summary: 'Google Meet Event',
        creator: {
            email: 'admin@jisrcareapp.com',
        },
        start: {
            dateTime: time.toISOString(false),
            timeZone: 'UTC',
        },
        end: {
            dateTime: time.add(1, 'hour').toISOString(false),
            timeZone: 'UTC',
        },
        conferenceData: {
            createRequest: {
                requestId: meetId,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
        anyoneCanAddSelf: true,
        attendees: emails,
        guestsCanModify: true,
        visibility: 'public',
    };
    try {
        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all',
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

// const eventData: EventDataItem[] = [
//     { email: 'sabbir.py@gmail.com' },
//     { email: 'admin@jisrcareapp.com' },
// ];

// createEvent(eventData, moment().add(1, 'hour')).then(() => {
//     console.log('Event created successfully');
// });
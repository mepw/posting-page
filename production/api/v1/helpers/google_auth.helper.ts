import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
});

const gmail = google.gmail({ version: 'v1', auth });

export default gmail;
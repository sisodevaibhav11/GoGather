const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
    // Logged once per cold start so it shows up clearly in Vercel function logs
    // instead of surfacing only as a vague "invalid_token" error during login.
    console.error(
        '[googleClient] GOOGLE_CLIENT_ID is not set. Google sign-in will fail until ' +
        'this is added to this project\'s Environment Variables in Vercel and redeployed.'
    );
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

exports.verifyGoogleToken = async (credential) => {
    if (!GOOGLE_CLIENT_ID) {
        const err = new Error('Server misconfiguration: GOOGLE_CLIENT_ID is not set.');
        err.statusCode = 500;
        throw err;
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
};

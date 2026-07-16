const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = (
    process.env.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_OAUTH_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    ''
).trim();

if (!GOOGLE_CLIENT_ID) {
    // Logged once per cold start so it shows up clearly in Vercel function logs
    // instead of surfacing only as a vague "invalid_token" error during login.
    console.error(
        '[googleClient] No Google client ID was found in GOOGLE_CLIENT_ID, ' +
        'GOOGLE_OAUTH_CLIENT_ID, or VITE_GOOGLE_CLIENT_ID. Google sign-in will fail ' +
        'until one of these is set in the backend deployment and redeployed.'
    );
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID || undefined);

const makeAuthError = (message, statusCode = 401) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

exports.verifyGoogleToken = async (credential) => {
    if (!GOOGLE_CLIENT_ID) {
        throw makeAuthError(
            'Server misconfiguration: set GOOGLE_CLIENT_ID on the backend deployment and redeploy.',
            500
        );
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        return ticket.getPayload();
    } catch (error) {
        const message = error?.message || 'Google sign-in verification failed.';

        console.error(`[googleClient] Google token verification failed: ${message}`);

        if (/audience|recipient/i.test(message)) {
            throw makeAuthError(
                'Google sign-in configuration mismatch. The frontend VITE_GOOGLE_CLIENT_ID and backend GOOGLE_CLIENT_ID must be the same OAuth client ID.'
            );
        }

        if (
            /Wrong number of segments|Invalid token|signature|issuer|expired|used too early|No pem found/i.test(message)
        ) {
            throw makeAuthError('Google sign-in could not be verified. Please try again.');
        }

        error.statusCode = error.statusCode || 500;
        throw error;
    }
};

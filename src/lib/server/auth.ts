import { prisma } from '$lib/server/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { Resend } from 'resend';
import { error } from 'console';

const resend = new Resend(process.env.RESEND_API_KEY!);

export interface JWTPayload {
    id: number;
    callsign: string;
}

function generateToken() {
    return randomBytes(32).toString('hex');
}

function signAccessToken(user: { id: number }, callsign: string) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    return jwt.sign({ id: user.id, callsign }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function createRefreshToken(userId: number) {
    const token = generateToken();

    const refreshToken = await prisma.refreshToken.create({
        data: {
            userId,
            token,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });

    return refreshToken.token;
}

async function refresh(refreshToken: string) {
    const refresh = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
    });

    if (!refresh) {
        throw new Error('Invalid refresh token');
    }

    if (!refresh.valid) {
        throw new Error('Refresh token revoked');
    }

    if (refresh.expires < new Date()) {
        throw new Error('Refresh token expired');
    }

    const user = await prisma.user.findUnique({
        where: { id: refresh.userId }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const callsignRecord = await prisma.callsign.findFirst({
        where: { userId: user.id }
    });

    if (!callsignRecord) {
        throw new Error('User does not have a callsign');
    }

    const newAccessToken = signAccessToken(user, callsignRecord.callsign);
    const newRefreshToken = await createRefreshToken(user.id);

    await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { valid: false }
    });

    return {
        token: newAccessToken,
        refreshToken: newRefreshToken
    };
}

async function register(email: string, password: string, callsign: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword
        }
    });
    try {
        await prisma.callsign.create({
            data: {
                callsign,
                userId: user.id,
                status: 'ACTIVE',
                country: ''
            }
        });
    } catch (err) {
        try {
            const existing = await prisma.callsign.findUnique({
                where: { callsign }
            });

            if (existing && existing.userId == null) {
                await prisma.callsign.update({
                    where: { id: existing.id },
                    data: {
                        userId: user.id,
                        status: 'ACTIVE',
                        country: existing.country ?? ''
                    }
                });
            } else {
                console.error('Failed to create callsign for new user:', err);
                throw err;
            }
        } catch (updateErr) {
            console.error('Error attaching existing callsign to user:', updateErr);
            throw updateErr;
        }

    }

    sendVerifyEmail(email);
}

function verifyAccessToken(token: string): JWTPayload {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
}

async function getUserFromAccessToken(token: string) {
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
        where: { id: payload.id }
    });

    if (!user) {
        throw new Error('User associated with this token no longer exists');
    }

    return user;
}

async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user?.emailVerified) {
        throw new Error('Email not verified');
    }

    if (!user) {
        throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new Error('Invalid password');
    }

    const refreshToken = await createRefreshToken(user.id);

    return {
        refreshToken
    };
}

async function sendVerifyEmail(email: string) {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const emailToken = generateToken();

    const tokenHash = createHash('sha256').update(emailToken).digest('hex');

    await prisma.user.update({
        where: { id: user.id },
        data: { emailToken: tokenHash }
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { emailTokenExpires: new Date(Date.now() + 60 * 60 * 1000) }
    });

    const verificationUrl = `https://callsigns.liminal.moe/verify-email?token=${emailToken}&email=${encodeURIComponent(email)}`;

    await resend.emails.send({
        from: 'HamLookup <verify@mail.liminal.moe>',
        to: [email],
        subject: 'Verify your email address',
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Account</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0f172a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                            
                            <tr>
                                <td style="padding: 40px 40px 20px 40px;">
                                    <div style="display: inline-block; background-color: #eab308; width: 40px; height: 4px; border-radius: 2px; margin-bottom: 20px;"></div>
                                    <h1 style="color: #f1f5f9; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">
                                        Welcome to the Shack
                                    </h1>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 0 40px 40px 40px;">
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                        Thanks for signing up! We're excited to have you on board. Before you can start looking up callsigns and checking propagation data, we just need to confirm it's you.
                                    </p>

                                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td align="center" style="border-radius: 8px; background-color: #f1f5f9;">
                                                <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #0f172a; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em;">
                                                    Verify Account
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px;">
                                        If the button doesn't work, copy and paste this link into your browser:<br>
                                        <a href="${verificationUrl}" style="color: #38bdf8; text-decoration: none; word-break: break-all;">${verificationUrl}</a>
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px;">
                            <tr>
                                <td align="center" style="padding: 24px; color: #94a3b8; font-size: 12px;">
                                    <p style="margin: 0;">&copy; 2024 Your App Name. 73!</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>`
    });
}

async function logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
        where: {
            token: refreshToken,
            valid: true
        },
        data: { valid: false }
    });
}

export {
    signAccessToken,
    createRefreshToken,
    refresh,
    register,
    verifyAccessToken,
    getUserFromAccessToken,
    login,
    logout
};

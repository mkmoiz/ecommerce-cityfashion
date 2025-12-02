import { OAuth2Client } from 'google-auth-library';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prismaClient.js';
import { generateJwt } from '../utils/generateJwt.js';

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

export async function googleLogin(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || email;
    const picture = payload.picture || null;

    if (!email) {
      return res.status(400).json({ message: 'Email is required from Google' });
    }

    const user = await prisma.user.upsert({
      where: { googleId },
      update: {
        email,
        name,
        profilePicture: picture,
      },
      create: {
        googleId,
        email,
        name,
        profilePicture: picture,
        // role: 'CUSTOMER' by default from schema
      },
    });

    const token = generateJwt(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ message: 'Auth failed' });
  }
}

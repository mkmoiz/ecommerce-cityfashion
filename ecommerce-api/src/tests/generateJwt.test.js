import { jest, describe, it, expect } from '@jest/globals';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../config/env.js', () => ({
  ENV: {
    JWT_SECRET: 'test-secret',
  },
}));

const { generateJwt } = await import('../utils/generateJwt.js');

describe('generateJwt', () => {
  it('should generate a valid JWT with correct payload', () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      role: 'CUSTOMER',
    };

    const token = generateJwt(user);
    const decoded = jwt.verify(token, 'test-secret');

    expect(decoded).toMatchObject({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    expect(decoded.exp).toBeDefined();
  });
});

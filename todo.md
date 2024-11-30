## TODO for this repo

### Add functionality of access and refresh token

- Update user schema, add refreshToken as optional field
- add a generic function for generating access and refresh token
- add cookie functionality in server, add expiration , secret and options
- Update auth middleware

  ```
  const jwt = require('jsonwebtoken');
  const secretKey = process.env.JWT_SECRET; // Access token secret
  const refreshSecretKey = process.env.REFRESH_TOKEN_SECRET; // Refresh token secret

  const authenticate = (req, res, next) => {
  const accessToken = req.headers['authorization']?.split(' ')[1]; // Extract token from Bearer header
  const refreshToken = req.cookies?.refreshToken;

  // If no tokens provided, deny access
  if (!accessToken && !refreshToken) {
  return res.status(401).json({ message: 'Access Denied. No tokens provided.' });
  }

  // Try to verify the access token
  if (accessToken) {
  try {
      const decoded = jwt.verify(accessToken, secretKey);
      req.user = decoded.user; // Attach user info to the request object
      return next(); // Proceed to the next middleware or route handler
  } catch (error) {
      if (error.name !== 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid access token.' });
      }
      // If access token is expired, proceed to validate the refresh token
  }
  }

  // Validate refresh token and generate a new access token
  if (refreshToken) {
  try {
      const decoded = jwt.verify(refreshToken, refreshSecretKey);

      // Generate a new access token
      const newAccessToken = jwt.sign(
      { user: decoded.user }, // Payload from the refresh token
      secretKey,
      { expiresIn: '1h' }
      );

      // Optionally, refresh the refresh token (e.g., extend its expiry date)
      const newRefreshToken = jwt.sign(
      { user: decoded.user },
      refreshSecretKey,
      { expiresIn: '7d' }
      );

      // Set new tokens in response
      res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production', // Ensure secure in production
      });

      res.setHeader('Authorization', `Bearer ${newAccessToken}`);
      req.user = decoded.user; // Attach user info to the request object

      return next();
  } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
  }

  return res.status(401).json({ message: 'Access Denied. Tokens invalid or expired.' });
  };

  module.exports = authenticate;
  ```

- move code to typesscript

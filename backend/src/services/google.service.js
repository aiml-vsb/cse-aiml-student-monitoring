const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = require("../config/env");
const { signToken } = require("../lib/jwt");
const prisma = require("../lib/prisma");

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email found from Google"));

        // Find or create user as STUDENT
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              role: "STUDENT",
              username: profile.displayName,
              emailVerified: true,
              profileComplete: false,
            },
          });
        }

        // Generate JWT
        const token = signToken({ id: user.id, role: user.role, email: user.email });
        return done(null, { user, token });
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;
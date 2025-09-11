const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('./models/User');

passport.use(new GoogleStrategy({
  clientID: "536320793685-b6i8vq0s0gqt64psrt57nici4pddcbnu.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:5000/api/users/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

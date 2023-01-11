const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
  //console.log(user);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  //User.findById(id, function(err, user) {
    done(null, user);
  //});
});

passport.use(new GoogleStrategy({
    clientID:"283739518948-0tep0134hha25g19qd59qcv521gl2gm3.apps.googleusercontent.com",
    clientSecret:"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",
    //callbackURL:"http://localhost:3000/google/callback" //Aquí va el link del desplegado
    callbackURL:"https://proyecto22cicd-dlcxminffa-no.a.run.app/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    //User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return done(null, profile);
    //});
  }
));
const request = require("request");
const querystring = require('querystring');

// Spotify stuff
const client_id = '<CLIENT_ID_HERE>'; // Your client id
const client_secret = '<CLIENT_SECRET_HERE>'; // Your secret
const redirect_uri = 'https://bumpordump.media/callback'; // Your redirect uri

// Helper function to generate a random alphanumeric string
const generateRandomString = function(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const stateKey = 'spotify_auth_state';

module.exports = (app) => {
    app.get('/v1/auth/login', (req, res) => {
        const state = generateRandomString(16);
        res.cookie(stateKey, state);

        // accessing user data requires authentication
        const scope = 'user-top-read streaming user-read-private user-read-email user-read-playback-state user-modify-playback-state user-library-read user-library-modify playlist-modify-public';
        res.redirect('https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: client_id,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state
            }));
    });

    app.get('/callback', (req, res) => {
        let code = req.query.code || null;
        let state = req.query.state || null;
        let storedState = req.cookies ? req.cookies[stateKey] : null;

        if (state === null || state !== storedState) {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'state_mismatch'
                }));
        } else {
            res.clearCookie(stateKey);
            let authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                },
                json: true
            };

            request.post(authOptions, function(error, response, body) {
                if (!error && response.statusCode === 200) {

                    res.redirect(`/listen/${body.access_token}`);
                } else {
                    res.redirect('/#' +
                        querystring.stringify({
                            error: 'invalid_token'
                        }));
                }
            });
        }
    });

    app.get('/v1/auth/user_id/:token', (req, res) =>  {
        let options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + req.params.token },
            json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
            if (error) {
                res.status(400).send({error: 'Unable to get user_id'})
            } else {
                res.status(200).send({user_id: body.id});
            }
        });
    });
};

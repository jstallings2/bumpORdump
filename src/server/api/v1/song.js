const request = require("request");

const artistString = (artists) => {
  let result = '';
  for (let i = 0; i < artists.length && i < 5; ++i) {
      if (i === 0) {
          result += artists[0];
          artists.slice(0, 1);
      } else {
          result += `,${artists[0]}`;
          artists.slice(0, 1);
      }
  }
  return result;
};

const getArtistsList = (artists) => {
    let aList = '';
    artists.forEach((artist, index) => {
        if (index === 0) {
            aList += artist.name;
        } else {
            aList += `, ${artist.name}`;
        }
    });
    return aList;
};

module.exports = (app) => {
    app.post('/v1/song/add', (req, res) => {
        if (req.body.token === '') {
            res.status(401).send({error: 'Unauthorized'});
        } else {
            let options = {
                url: 'https://api.spotify.com/v1/me/tracks',
                headers: { 'Authorization': 'Bearer ' + req.body.token },
                json: true,
                body: {
                    'ids': [`${req.body.uri.replace('spotify:track:', '')}`]
                }
            };
            request.put(options, (error, response, body) => {
                if (error || (body && body.error)) {
                    res.status(response.statusCode).send({error: 'Unable to add song to library'});
                } else {
                    if (req.body.playlist_id === '') {
                        let options = {
                            url: `https://api.spotify.com/v1/users/${req.body.user_id}/playlists`,
                            headers: { 'Authorization': 'Bearer ' + req.body.token },
                            json: true,
                            body: {
                                'name': `bumpORdump${Date.now()}`,
                                'description': 'A playlist made using bumpORdump!!'
                            }
                        };
                        request.post(options, (error, response, body) => {
                            if (error || (body && body.error)) {
                                res.status(response.statusCode).send({error: 'Unable to create playlist'});
                            } else {
                                let playlistId = body.id;
                                let options = {
                                    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                                    headers: { 'Authorization': 'Bearer ' + req.body.token },
                                    json: true,
                                    body: {
                                        'uris': [`${req.body.uri}`]
                                    }
                                }
                                request.post(options, (error, response, body) => {
                                    if (error || (body && body.error)) {
                                        res.status(response.statusCode).send({error: 'Unable to add song to playlist'});
                                    } else {
                                        res.status(200).send({playlist_id: playlistId});
                                    }
                                });
                            }
                        });
                    } else {
                        let options = {
                            url: `https://api.spotify.com/v1/playlists/${req.body.playlist_id}/tracks`,
                            headers: { 'Authorization': 'Bearer ' + req.body.token },
                            json: true,
                            body: {
                                'uris': [`${req.body.uri}`]
                            }
                        }
                        request.post(options, (error, response, body) => {
                            if (error || (body && body.error)) {
                                res.status(response.statusCode).send({error: 'Unable to add song to playlist'});
                            } else {
                                res.status(200).send({success: 'Song liked successfully'});
                            }
                        });
                    }
                }
            });
        }
    });
    app.post('/v1/song/skip', (req, res) => {
        if (req.body.token === '') {
            res.status(401).send({error: 'Unauthorized'});
        } else {
            let options = {
                url: 'https://api.spotify.com/v1/me/player/next',
                headers: { 'Authorization': 'Bearer ' + req.body.token },
                json: true
            };
            request.post(options, (error, response) => {
                if (error) {
                    res.status(response.statusCode).send({error: 'Unable to skip song'});
                } else {
                    res.status(200).send({success: 'Song skipped successfully'});
                }
            });
        }
    });

    app.post('/v1/song/recommendations', (req, res) => {
        if (req.body.token === '') {
            res.status(401).send({error: 'Unauthorized'});
        } else {
            if (req.body.uris.length !== 0) {
                let idString = '';
                req.body.uris.forEach((uri, index) => {
                    if (index === 0) {
                        idString += uri.replace('spotify:track:', '');
                    } else {
                        idString += `,${uri.replace('spotify:track:', '')}`;
                    }
                });
                let options = {
                    url: `https://api.spotify.com/v1/recommendations?limit=100&seed_tracks=${idString}`,
                    headers: { 'Authorization': 'Bearer ' + req.body.token },
                    json: true
                };
                request.get(options, (error, response, body) => {
                    if (error || (body && body.error)) {
                        res.status(response.statusCode).send({error: 'Unable to get Songs'});
                    } else {
                        let tracks = body.tracks;
                        let uris = [];
                        let fsong = {
                            name: '',
                            artist: '',
                            album: '',
                            album_art: '',
                            uri: ''
                        };
                        let options = {
                            url: `https://api.spotify.com/v1/tracks/${tracks[0].id}`,
                            headers: { 'Authorization': 'Bearer ' + req.body.token },
                            json: true
                        };
                        request.get(options, (error, response, body) => {
                            if (error || (body && body.error)) {
                                res.status(response.statusCode).send({error: 'Unable to get Song'});
                            } else {
                                fsong = {
                                    title: body.name,
                                    artist: getArtistsList(body.artists),
                                    album: body.album.name,
                                    album_art: body.album.images[0].url,
                                    uri: body.uri
                                };
                                tracks.forEach(track => {
                                    uris.push(track.uri);
                                });
                                res.status(200).send({
                                    fsong: fsong,
                                    uris: uris
                                });
                            }
                        });
                    }
                });
            } else {
                if (req.body.first) {
                    let options = {
                        url: 'https://api.spotify.com/v1/me/top/artists?limit=50',
                        headers: { 'Authorization': 'Bearer ' + req.body.token },
                        json: true
                    };
                    request.get(options, (error, response, body) => {
                        if (error || (body && body.error)) {
                            res.status(response.statusCode).send({error: 'Unable to get top artists'});
                        } else {
                            let artists = body.items;
                            let arr = [];
                            artists.forEach(artist => {
                               arr.push(artist.id);
                            });
                            let artistQString = artistString(arr);
                            let options = {
                                url: `https://api.spotify.com/v1/recommendations?limit=100&seed_artists=${artistQString}`,
                                headers: { 'Authorization': 'Bearer ' + req.body.token },
                                json: true
                            };
                            request.get(options, (error, response, body) => {
                                if (error || (body && body.error)) {
                                    res.status(response.statusCode).send({error: 'Unable to get Songs'});
                                } else {
                                    let tracks = body.tracks;
                                    let uris = [];
                                    let fsong = {
                                        name: '',
                                        artist: '',
                                        album: '',
                                        album_art: '',
                                        uri: ''
                                    };
                                    let options = {
                                        url: `https://api.spotify.com/v1/tracks/${tracks[0].id}`,
                                        headers: { 'Authorization': 'Bearer ' + req.body.token },
                                        json: true
                                    };
                                    request.get(options, (error, response, body) => {
                                        if (error || (body && body.error)) {
                                            res.status(response.statusCode).send({error: 'Unable to get Song'});
                                        } else {
                                            fsong = {
                                                title: body.name,
                                                artist: getArtistsList(body.artists),
                                                album: body.album.name,
                                                album_art: body.album.images[0].url,
                                                uri: body.uri
                                            };
                                            tracks.forEach(track => {
                                                uris.push(track.uri);
                                            });
                                            res.status(200).send({
                                                fsong: fsong,
                                                uris: uris,
                                                artists: arr
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    if (req.body.artists.length === 0) {
                        res.send(200).status({done: 'Go to Results'});
                    } else {
                        let artistQString = artistString(req.body.artists);
                        let options = {
                            url: `https://api.spotify.com/v1/recommendations?limit=100&seed_artists=${artistQString}`,
                            headers: { 'Authorization': 'Bearer ' + req.body.token },
                            json: true
                        };
                        request.get(options, (error, response, body) => {
                            if (error || (body && body.error)) {
                                res.status(response.statusCode).send({error: 'Unable to get Songs'});
                            } else {
                                let tracks = body.tracks;
                                let uris = [];
                                let fsong = {
                                    name: '',
                                    artist: '',
                                    album: '',
                                    album_art: '',
                                    uri: ''
                                };
                                let options = {
                                    url: `https://api.spotify.com/v1/tracks/${tracks[0].id}`,
                                    headers: { 'Authorization': 'Bearer ' + req.body.token },
                                    json: true
                                };
                                request.get(options, (error, response, body) => {
                                    if (error || (body && body.error)) {
                                        res.status(response.statusCode).send({error: 'Unable to get Song'});
                                    } else {
                                        fsong = {
                                            title: body.name,
                                            artist: getArtistsList(body.artists),
                                            album: body.album.name,
                                            album_art: body.album.images[0].url,
                                            uri: body.uri
                                        };
                                        tracks.forEach(track => {
                                            uris.push(track.uri);
                                        });
                                        res.status(200).send({
                                            fsong: fsong,
                                            uris: uris,
                                            artists: req.body.artists
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }
    });
};
import React, {Fragment, useEffect, useState} from "react";
import SpotifyWebPlayer from "react-spotify-web-playback";
import styled from "styled-components";

const Player = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
`;

const AlbumArtBase = styled.div`
  position: fixed;
  bottom: 25%;
  left: 35%;
  display: inline-block;
  width: 30%;
`;

const ButtonBase = styled.div`
  margin: 5px;
  position: fixed;
  bottom: 10%;
  width: 10%;
  cursor: pointer;
`;

const MImage = styled.img`
  position: relative;
  height: auto;
  width: 100%;
`;

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

const getRecs = async (first, token, user_id, artists, uris) => {
    const response = await fetch('/v1/song/recommendations', {
        body: JSON.stringify({
            first: first,
            uris: uris,
            token: token,
            user_id: user_id,
            artists: artists
        }),
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }
    });
    const json = response.json();
    if (response.ok) {
        return json;
    } else {
        return undefined;
    }
};

export const Listen = ({sendResults, match}) => {
    let [stats, setStats] = useState({
        start: Date.now(),
        liked: 0,
        likedUris: [],
        disliked: 0
    });
    let [curSong, setCurSong] = useState({
        title: '',
        artist: '',
        album: '',
        album_art: '',
        uri: ''
    });
    let [nextSong, setNextSong] = useState({
        title: '',
        artist: '',
        album: '',
        album_art: '',
        uri: ''
    });
    let [prevSong, setPrevSong] = useState({
        title: '',
        artist: '',
        album: '',
        album_art: '',
        uri: ''
    });
    let [uri, setUri] = useState([]);
    let [state, setState] = useState({
        artists: [],
        playlist_id: '',
        user_id: '',
        token: match.params.token
    });
    useEffect(() => {
        const getUserId = async () => {
            const response = await fetch(`/v1/auth/user_id/${state.token}`);
            const json = await response.json();
            setState({...state, user_id: json.user_id});
        }
        getUserId();
    }, []);
    useEffect(() => {
        if (state.user_id !== '') {
            const getNewUris = async () => {
                const newUris =  await getRecs(true, state.token, state.user_id, state.artists, stats.likedUris);
                setStats({...stats, likedUris: []});
                if (newUris) {
                    setUri(newUris.uris);
                    setCurSong({
                        title: newUris.fsong.title,
                        artist: newUris.fsong.artist,
                        album: newUris.fsong.album,
                        album_art: newUris.fsong.album_art,
                        uri: newUris.uris[0]
                    });
                    setState({
                       ...state,
                       artists: newUris.artists
                    });
                } else {
                    sendResults(stats.start, stats.liked, stats.disliked);
                }
            };
            getNewUris();
        }
    }, [state.user_id]);
    useEffect(() => {
        if (stats.likedUris.length === 5) {
            const getNewUris = async () => {
                const newUris = await getRecs(false, state.token, state.user_id, state.artists, stats.likedUris);
                setStats({...stats, likedUris: []});
                if (newUris) {
                    setUri(newUris.uris);
                    setCurSong({
                        title: newUris.fsong.title,
                        artist: newUris.fsong.artist,
                        album: newUris.fsong.album,
                        album_art: newUris.fsong.album_art,
                        uri: newUris.uris[0]
                    });
                    setNextSong({
                        title: '',
                        artist: '',
                        album: '',
                        album_art: '',
                        uri: ''
                    });
                } else {
                    sendResults(stats.start, stats.liked, stats.disliked);
                }
            };
            getNewUris();
        }
    }, [stats]);
    let OnFire = ev => {
      ev.preventDefault();
        if (curSong.uri !== '') {
            const likeSong = async () => {
                const response = await fetch(`/v1/song/add`, {
                   body: JSON.stringify({
                       uri: curSong.uri,
                       token: state.token,
                       user_id: state.user_id,
                       playlist_id: state.playlist_id
                   }),
                   method: 'POST',
                   headers: {
                       'content-type': 'application/json'
                   }
                });
                const json = await response.json();
                if (response.ok) {
                    if (json.playlist_id) {
                        setState({...state, playlist_id: json.playlist_id});
                    }
                    let arr = stats.likedUris;
                    arr.push(curSong.uri);
                    setStats({...stats, liked: Number(stats.liked) + 1, likedUris: arr});
                } else {
                    alert('Error saving song');
                }
            };
            likeSong();
        }
    };
    let OnTrash = ev => {
      ev.preventDefault();
      if (curSong.uri !== '') {
          const skipSong = async () => {
              const response = await fetch(`/v1/song/skip`, {
                  method: 'POST',
                  body: JSON.stringify({
                      token: state.token
                  }),
                  headers: {
                      'content-type': 'application/json'
                  }
              });
              const json = await response.json();
              if (response.ok) {
                  setStats({...stats, disliked: Number(stats.disliked) + 1});
              } else {
                  alert(json.error);
              }
          };
          skipSong();
      }
    };
    let OnResults = ev => {
        ev.preventDefault();
        sendResults(stats.start, stats.liked, stats.disliked);
    };
    let OnChange = (st) => {
        if (st) {
            if (!nextSong.title) {
                if (st.nextTracks.length !== 0) {
                    setNextSong({
                        title: st.nextTracks[0].name,
                        artist: getArtistsList(st.nextTracks[0].artists),
                        album: st.nextTracks[0].album.name,
                        album_art: st.nextTracks[0].album.images[2].url,
                        uri: st.nextTracks[0].uri
                    });
                }
            } else if (st.track.name === nextSong.title) {
                setPrevSong({
                    title: curSong.title,
                    artist: curSong.artist,
                    album: curSong.album,
                    album_art: curSong.album_art,
                    uri: curSong.uri
                });
                setCurSong({
                    title: nextSong.title,
                    artist: nextSong.artist,
                    album: nextSong.album,
                    album_art: nextSong.album_art,
                    uri: nextSong.uri
                });
                if (st.nextTracks.length !== 0) {
                    setNextSong({
                        title: st.nextTracks[0].name,
                        artist: getArtistsList(st.nextTracks[0].artists),
                        album: st.nextTracks[0].album.name,
                        album_art: st.nextTracks[0].album.images[2].url,
                        uri: st.nextTracks[0].uri
                    });
                }
            } else if (st.track.name === prevSong.title) {
                setCurSong({
                    title: prevSong.title,
                    artist: prevSong.artist,
                    album: prevSong.album,
                    album_art: prevSong.album_art,
                    uri: prevSong.uri
                });
                setNextSong({
                    title: st.nextTracks[0].name,
                    artist: getArtistsList(st.nextTracks[0].artists),
                    album: st.nextTracks[0].album.name,
                    album_art: st.nextTracks[0].album.images[2].url,
                    uri: st.nextTracks[0].uri
                });
                if (st.previousTracks.length !== 0) {
                    setPrevSong({
                        title: st.previousTracks[0].name,
                        artist: getArtistsList(st.previousTracks[0].artists),
                        album: st.previousTracks[0].album.name,
                        album_art: st.previousTracks[0].album.images[2].url,
                        uri: st.previousTracks[0].uri
                    });
                }
            }
            if (uri.length > 0 && uri.lastIndexOf(st.track.uri) === uri.length - 5) {
                const getNewUris = async () => {
                    const newUris = await getRecs(false, state.token, state.user_id, state.artists, stats.likedUris);
                    setStats({...stats, likedUris: []});
                    if (newUris) {
                        setUri(newUris.uris);
                        setCurSong({
                            title: newUris.fsong.title,
                            artist: newUris.fsong.artist,
                            album: newUris.fsong.album,
                            album_art: newUris.fsong.album_art,
                            uri: newUris.uris[0]
                        });
                        setNextSong({
                            title: '',
                            artist: '',
                            album: '',
                            album_art: '',
                            uri: ''
                        });
                        if (newUris.artists !== state.artists) {
                            setState({...state, artists: newUris.artists})
                        }
                    } else {
                        sendResults(stats.start, stats.liked, stats.disliked);
                    }
                };
                getNewUris();
            }
        }
    };
    return (
        <Fragment>
            <button style={{position: 'fixed', right: 0}} onClick={OnResults}>
                Go To Results
            </button>
            <h2>Now Playing:</h2>
            <p>Title: {curSong.title}</p>
            <p>Artist: {curSong.artist}</p>
            <p>Album: {curSong.album}</p>
            <div>
                <ButtonBase style={{left: '10%'}} onClick={OnTrash}>
                    <MImage src={'/images/trash.png'}/>
                </ButtonBase>
                <AlbumArtBase>
                    <MImage src={curSong.album_art}/>
                </AlbumArtBase>
                <ButtonBase style={{right: '10%'}} onClick={OnFire}>
                    <MImage src={'/images/fire.png'}/>
                </ButtonBase>
            </div>
            <Player>
                <SpotifyWebPlayer
                    token={state.token}
                    uris={uri}
                    callback={(state) => OnChange(state)}
                />
            </Player>
        </Fragment>
    );
};
import React, { useState } from "react";
import { render } from "react-dom";
import {BrowserRouter, Redirect, Route} from "react-router-dom";

import {Start} from "./components/start";
import {Listen} from "./components/listen";
import {Top} from "./components/top";
import {Results} from "./components/results";

const MyApp = () => {
  let [state, setState] = useState({
     start: 0,
     liked: 0,
     disliked: 0
  });
  const resultsReceived = () => {
      return state.start !== 0;
  };
  const sendResults = (start, liked, disliked) => {
      setState({
          start: start,
          liked: liked,
          disliked: disliked
      });
  };
  return (
      <BrowserRouter>
          <Top/>
          <Route exact path="/" component={Start} />
          <Route
              path="/listen/:token"
              render={p =>
                  resultsReceived() ? (
                      <Redirect to={'/results'} />
                  ) : (
                      <Listen {...p} sendResults={sendResults} />
                  )
              }
          />
          <Route path="/results" render={p => <Results {...p} results={state} />} />
      </BrowserRouter>
  );
};

render(<MyApp />, document.getElementById("mainDiv"));
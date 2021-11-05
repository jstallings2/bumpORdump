import React, {Fragment, useEffect, useState} from "react";
import styled from "styled-components";

const ResultsBase = styled.div`
  display: flex;
  justify-content: center
`;

export const Results = ({results}) => {
    return (
      <Fragment>
          <ResultsBase>
              <h1>We hope you found lots of new music</h1>
          </ResultsBase>
          <ResultsBase>
              <h2>Your results:</h2>
          </ResultsBase>
          <ResultsBase>
              <ul>
                  <li>Total Time Listened: {(Date.now() - results.start) / 1000} Seconds</li>
                  <li>Total Tracks Liked: {results.liked}</li>
                  <li>Total Tracks Disliked: {results.disliked}</li>
              </ul>
          </ResultsBase>
      </Fragment>
    );
};
import React, {Fragment} from "react";
import styled from "styled-components";

const StartBase = styled.div`
  display: flex;
  justify-content: center;
`;

const LoginLink = styled.a`
  text-decoration: none;
  background-color: gray;
  color: black;
  padding: 2px 6px 2px 6px;
  border-top: 1px solid #CCCCCC;
  border-right: 1px solid #333333;
  border-bottom: 1px solid #333333;
  border-left: 1px solid #CCCCCC;
`;

export const Start = () => {
    return (
        <Fragment>
            <StartBase>
                <h2>Welcome to bumpORdump 😤</h2>
            </StartBase>
            <StartBase>
                <LoginLink href={'/v1/auth/login'}>Login in with Spotify</LoginLink>
            </StartBase>
            <StartBase>
                <p>The Rules: We will find you music. Like tracks to add them to your library and to a new playlist, dislike tracks to skip</p>
            </StartBase>
            <StartBase>
                <p>Disclaimer: To use our service you must log into your Spotify account and allow us to use you Spotify Information</p>
            </StartBase>
        </Fragment>
    )
};
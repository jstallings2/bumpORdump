import React from "react";
import styled from "styled-components";

const TopBase = styled.div`
  display: flex;
  justify-content: center
`;

export const Top = () => (
    <TopBase>
        <h1 style={{fontFamily: 'Cursive'}}>bumpORdump</h1>
    </TopBase>
);
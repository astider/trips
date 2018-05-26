import React from 'react';
import styled from 'styled-components';
import { compose, withState, withProps } from 'recompose';
import axios from 'axios';
import isEqual from 'lodash.isequal';

import PlaceBox from './PlaceBox'

const searchPlace = async (query) => {
  const searchPlaceURL = 'https://us-central1-whatismlkit.cloudfunctions.net/searchPlace?place=';
  const response = await axios.get(searchPlaceURL + query);
  return response.data.results;
}

const Container = styled.div`
  padding: 8px 16px;
  height: 100%;
  background-color: #ffffff;
  @media(max-width: 720px) {
    padding: 8px 8px;
  }
`;

const Title = styled.h2`
  font-weight: 500;
  font-size: 24px;
`;

const InputContainer = styled.div`
  margin: 8px auto;
`;

const Input = styled.input`
  width: 100%;
  border-radius: 6px;
  border: 1px solid #d8d8d8;
  padding: 5px 16px;
  margin: 8px 0;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
`;

const Submit = styled.button`
  cursor: pointer;
  width: 100%;
  height: 32px;
  border-radius: 6px;
  background-color: #4885ed;
  color: #ffffff; 
  border: none;
  outline: none;
`;

const enhance = compose(
  withState('searchText', 'setSearchText', ''),
  withState('placeLoading', 'setPlaceLoading', false),
  withState('place', 'setPlace', []),
  withState('collectPlaces', 'setCollectPlaces', []),
  withProps(
    props => ({
      onTextChange: (e) => props.setSearchText(e.target.value),
      onSubmitSearch: async (e) => {
        e.preventDefault();
        const { searchText, setPlaceLoading, setPlace } = props;

        setPlaceLoading(true);
        const query = searchText;
        const data = await searchPlace(query);
        setPlace(data);
        setPlaceLoading(false);
      },
      onClickPlaceItem: (index) => {
        const { setCollectPlaces, collectPlaces, place } = props;
        const filtered = collectPlaces.filter(p => (isEqual(p, place[index])) && true);
        if (filtered.length === 0) setCollectPlaces([ ...collectPlaces, place[index] ]);
      }
    })
  ),
);
 
const App = (props) => {
  const { searchText, onTextChange, onSubmitSearch, placeLoading, place, onClickPlaceItem, collectPlaces } = props;
  return (
    <Container>
      <Title>Enter Place name:</Title>
      <InputContainer>
        <form onSubmit={onSubmitSearch}>
          <Input onChange={onTextChange} value={searchText} />
          <Submit type="submit" onSubmit={onSubmitSearch}>Search</Submit>
        </form>
      </InputContainer>
      <Title>Saved Places:</Title>
      <PlaceBox places={collectPlaces} placeHolder="No saved places" saveable />
      <Title>Search Results:</Title>
      <PlaceBox
        placeHolder="No result to be shown"
        places={place}
        handleClick={onClickPlaceItem}
        withLoading
        loading={placeLoading}
      />
    </Container>
  );
};

export default enhance(App);

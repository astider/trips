import React from 'react';
import styled from 'styled-components';
import { compose, withState, withProps } from 'recompose';
import axios from 'axios';

const searchPlace = async (query) => {
  const response = await axios.get(`https://us-central1-whatismlkit.cloudfunctions.net/searchPlace?place=${query}`);
  return response.data.results;
}

const getImage = async (ref) => {
  
}

const Container = styled.div`
  padding: 64px 16px;
  height: 100%;
  background-color: #ffffff;
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

const PlaceContainer = InputContainer.extend`
  ${props => props.loading && 'content: "loading";'}
  padding: 8px;
`;

const PlaceInfo = styled.div`
  border: 1px solid #d8d8d8;
  border-radius: 6px;
`;

const PlaceItem = styled.div`
  cursor: pointer;
  padding: 2px 8px;
  &:hover {
    background-color: #e4e4e4;
  }
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
        setCollectPlaces([ ...collectPlaces, place[index] ]);
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
      <PlaceContainer>
        {collectPlaces.length === 0 && <PlaceItem>No Place saved</PlaceItem>}
        {collectPlaces.length > 0 && 
          <PlaceInfo>
            {collectPlaces.map((p, index) =>
              <PlaceItem key={index}>
                <p>{p.name}</p>
              </PlaceItem>
            )}
          </PlaceInfo>
        }
      </PlaceContainer>
      <Title>Search Results:</Title>
      <PlaceContainer>
        {placeLoading && 'Loading นะจ๊ะ'}
        {(!placeLoading && place.length === 0) && <PlaceItem>No result to be shown</PlaceItem>}
        {place.length > 0 && 
          <PlaceInfo>
            {place.map((p, index) =>
              <PlaceItem key={index} onClick={() => onClickPlaceItem(index)}>
                <p>{p.name}</p>
              </PlaceItem>
            )}
          </PlaceInfo>
        }
      </PlaceContainer>
    </Container>
  );
};

export default enhance(App);

import React from 'react';
import styled from 'styled-components';
import { compose, withState, withProps, lifecycle } from 'recompose';
import axios from 'axios';

const InputContainer = styled.div`
  margin: 8px auto;
  display: flex;
  justify-content: space-around;
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
  margin: auto 8px;
  width: 24%;
  height: 32px;
  border-radius: 6px;
  background-color: #4885ed;
  color: #ffffff; 
  border: none;
  outline: none;
`;

const SavedWord = styled.p`
  text-align: center;
`;

const PlaceContainer = styled.div`
  margin: 8px auto;
  padding: 8px;
`;

const PlaceInfo = styled.div`
  border: 1px solid #d8d8d8;
  border-radius: 6px;
`;

const PlaceItem = styled.div`
  cursor: pointer;
  border-bottom: 1px solid #d8d8d8;
  &:hover {
    background-color: #e4e4e4;
  }
  display: flex;
  justify-content: space-between;
`;

const Text = styled.p`
  font-size: 15px;
  margin: auto 0;
  padding: 0 8px;
  text-align: center;
  max-width: 160px;
  @media(max-width: 720px) {
    max-width: 128px;
  }
`;

const LinkDiv = styled.div`
  border-bottom: 1px #d8d8d8;
  margin: auto 16px auto;
  width: 56px;
  height: 56px;
  line-height: 56px;
  font-size: 32px;
  text-align: center;
  border-radius: 50%;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;

  background: url(${require('./images/maps-logo.png')}) no-repeat 8px center;
  background-size: 40px;

  &:hover {
    background-color: #4885ed;
  }

  @media(max-width: 720px) {
    border-radius: 6px;
    margin: auto 0;
    font-size: 16px;
  }
`;

const ImageContainer = styled.div`
  width: 200px;
  @media(max-width: 720px) {
    max-width: 128px;
  }
`;

const Image = styled.img`
  width: 100%;
  max-width: 160px;
  height: auto;
  border-radius: 6px;
  
`;

const getImgSrc = async (place, maxWidth) => {
  const baseURL = 'https://us-central1-whatismlkit.cloudfunctions.net/searchImage?ref=';
  const ref = place.photos[0].photo_reference;
  const imageSearchURL = `${baseURL}${ref}&width=${maxWidth}`
  const data = await axios.get(imageSearchURL);
  return data.data.src;
}

const genLink = (place) => {
  // CmRaAAAA8mLs7PdH008BEY4NxG9XorHpmieLEk6l2x3iQUl-kIIeyPec1aQ3Bj1BakyiG-QzcZrZepowOwG35jz2xfJWdQnWhsjvWUrNPw3OvCVaOQEesXtLaRT3LZZ2tL44YTNCEhDC8XAJeHARQPlynOxgj33QGhRgRFDtVTeTRDZQNdoiACefJp7ReA
  const id = place.place_id;
  const latlng = [place.geometry.location.lat, place.geometry.location.lng ];
  return `https://www.google.com/maps/search/?api=1&query=${latlng.join()}&query_place_id=${id}`
};

const savePlace = async (name, data) => {
  const saveUrl = 'https://us-central1-whatismlkit.cloudfunctions.net/savePlace';
  try {
    const result = await axios.post(saveUrl, {
      name,
      data
    });
    console.log(result.data);
    return null;

  } catch (e) {
    console.log(e);
    return e;
  }
};

const noEffectLink = (e) => {
  e.stopPropagation();
}

const enhance = compose(
  withState('name', 'setName', props => props.name),
  withState('imgSrc', 'setImgSrc', []),
  withState('saveStatus', 'setSaveStatus', false),
  withProps(
    props => ({
      save: async () => {
        const { setSaveStatus, places, imgSrc, name } = props;
        if (name) {
          setSaveStatus(false);
          const data = places.reduce((prev, next, i) => {
            prev[next.id] = {
              id: next.id,
              place_id: next.place_id,
              name: next.name,
              geometry: next.geometry,
              img: next.img || imgSrc[i]
            };
            return prev;
          }, {});
          const error = await savePlace(name, data);
          if (!error) setSaveStatus(true);
        } else alert('name not specify!');

      },
      
    })
  ),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      const oldPlaces = this.props.places;
      const newPlaces = nextProps.places;
      if (oldPlaces !== newPlaces && newPlaces.length > 0 ) {
        Promise.all(
          newPlaces.map(async (p) => {
            if (p.photos && p.photos.length > 0) {
              const url = await getImgSrc(p, 500);
              return url;
            } else return '';
          })
        )
        .then(urls => {
          this.props.setImgSrc(urls)
        })
        .catch(error => console.log('error will recieve props', error))
      }
    },
  })
);

const PlaceBox = (props) => {
  const {
    saveable = false,
    name,
    setName,
    save,
    saveStatus,
    handleClick,
    places,
    imgSrc,
    withLoading = false,
    loading = false,
    placeHolder
  } = props;
  return (
    <PlaceContainer>
      {(withLoading && loading) && 'Loading นะจ๊ะ'}
      {(!loading && places.length === 0) && <PlaceItem onClick={e => noEffectLink(e)}>{placeHolder}</PlaceItem>}
      {places.length > 0 && 
        <PlaceInfo>
          {places.map((p, index) =>
            <PlaceItem key={index} onClick={() => {
              if (handleClick)
                handleClick(index)
            }}>
              {(p.img || (p.photos && p.photos.length > 0)) &&
                <ImageContainer>
                  <Image src={p.img || imgSrc[index]} />
                </ImageContainer>
              }
              <Text>{p.name}</Text>
              <LinkDiv onClick={e => {
                noEffectLink(e);
                window.open(genLink(p), "_blank");
              }}>
              </LinkDiv>
            </PlaceItem>
          )}
        </PlaceInfo>
      }
      {(saveable && places.length > 0) &&
        <div>
          <InputContainer>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="name" />
            <Submit onClick={save}>Save</Submit>
          </InputContainer>
          {saveStatus && <SavedWord>Saved!</SavedWord>}
        </div>
      }
    </PlaceContainer>
  );
};

export default enhance(PlaceBox);
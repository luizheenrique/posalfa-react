import React, { Component } from 'react';
import {
    AppRegistry,
    View,
    TextInput,
    Button,
    ScrollView,
    ActivityIndicator,
    Text,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Geolocation,
    Platform,
    Image,
    Alert,
    Modal
} from 'react-native';

import axios from 'axios';

const PLACES_API_KEY = "AIzaSyAwBn-2GyOTdKOAlTPtcgrNfW_IfwO7R3I";
const MAPS_API_KEY = "AIzaSyA00cT_Dt_pEh02uvPjpmuW3jpxf172s5o";
const PLACES_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const PHOTO_URL = "https://maps.googleapis.com/maps/api/place/photo";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";
const MAP_URL = "https://maps.googleapis.com/maps/api/staticmap";

class App extends Component {

    state = {
        loading: false,
        error: null,
        places: null,
        query: null,
        latitude: null,
        longitude: null,
        modal: false
    }

    componentDidMount() {
        const config = { enableHighAccuracy: false };
        navigator.geolocation.getCurrentPosition(this.locationSuccess, this.locationError, config);
    }

    locationSuccess = (position) => {
        this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        })
    }

    locationError = (error) => {
        console.log(error);      
    }

    onChangeQuery = (query) => {
        this.setState({ query });
    }

    searchPlaces = () => {
        if (this.state.query != null) {
            this.setState({ loading: true });
            this.setState({
                places: null,
                error: null
            });
            axios.get(PLACES_URL, {
                params: {
                    query: this.state.query,
                    location: this.state.latitude + ',' + this.state.longitude,
                    key: PLACES_API_KEY
                }
            })
                .then((response) => {
                    if (response.status == "200") {
                        switch (response.data.status) {
                            case "OK":
                                places = response.data.results;
                                this.setState({
                                    places: places
                                });
                                break;
                            case "ZERO_RESULTS":
                                this.setState({
                                    error: "Nenhum resultado encontrado para sua busca!"
                                });
                                break;
                            case "OVER_QUERY_LIMIT":
                                this.setState({
                                    error: "Cota Ultrapassada"
                                });
                                break;
                            case "REQUEST_DENIED":
                                this.setState({
                                    error: "Solicição negada"
                                });
                                break;
                            case "INVALID_REQUEST":
                                this.setState({
                                    error: 'Pârametros inválidos'
                                });
                                break;
                        }
                    } else {
                        this.setState({
                            error: "Verifique sua conexão com internet"
                        })
                    }
                }).catch((exception) => {
                    this.setState({
                        error: "Verifique sua conexão com a Internet."
                    });
                }).finally(() => {
                    this.setState({
                        loading: false
                    });
                })
        } else {
            this.setState({error: 'Por favor preencha o campo "O que você procura"'})
        }
    }

    getPlace = (place_id) => {
        this.setState({
            place: null,
            loading: true,
            modal: true
        });
        axios.get(DETAILS_URL, {
            params: {
                placeid: place_id,
                key: PLACES_API_KEY
            }
        })
            .then((response) => {
                if (response.status == "200") {
                    switch (response.data.status) {
                        case "OK":
                            this.setState({
                                place: response.data.result
                            });
                            break;
                        case "ZERO_RESULTS":
                            this.setState({
                                error: "Nenhum resultado encontrado para sua busca!"
                            });
                            break;
                        case "OVER_QUERY_LIMIT":
                            this.setState({
                                error: "Cota Ultrapassada"
                            });
                            break;
                        case "REQUEST_DENIED":
                            this.setState({
                                error: "Solicição negada"
                            });
                            break;
                        case "INVALID_REQUEST":
                            this.setState({
                                error: "Pârametros inválidos"
                            });
                            break;
                    }
                } else {
                    this.setState({
                        error: "Verifique sua conexão com internet"
                    })
                }
            }).catch((exception) => {
                this.setState({
                    error: "Verifique sua conexão com a Internet."
                });
            }).finally(() => {
                this.setState({
                    loading: false
                });
            })
    }

    renderForm = () => {
        return (
            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: "#FFF",
                    marginBottom: 7.5
                }}
            >
                <TextInput
                    style={{
                        flex: 1,
                        padding: 5,
                        fontSize: 14,
                        borderRadius: 0
                    }}
                    value={this.state.query}
                    onChangeText={this.onChangeQuery}
                    onSubmitEditing={this.searchPlaces}
                    placeholder={"O que você procura?"}
                    underlineColorAndroid='transparent'
                />
                <Button
                    title={"Buscar"}
                    color={"#4db6ac"}
                    onPress={this.searchPlaces}
                />
            </View>
        )
    }

    renderItem = (place) => {
        let photo = null
        const { height, width } = Dimensions.get('window');
        if (typeof place.item.photos != 'undefined') {
            photo = <Image
                style={{
                    width: "100%",
                    height: 150,
                    marginBottom: 15
                }}
                source={{
                    uri: PHOTO_URL + '?maxwidth=' + width + '&photoreference=' + place.item.photos[0]["photo_reference"] + '&key=' + PLACES_API_KEY
                }}
            />;
        }
        return (
            <TouchableOpacity
                onPress={() => {
                    this.getPlace(place.item.place_id);
                }}
            >
                <View
                    key={place.item.id}
                    style={{
                        backgroundColor: '#FFF',
                        marginHorizontal: 0,
                        marginVertical: 7.5,
                        padding: 15,
                        elevation: 2,
                        shadowOffset: {
                            width: 2,
                            height: 2,
                        },
                        shadowColor: '#333'
                    }}>
                    {photo}
                    <Text
                        style={{
                            fontWeight: "bold",
                            fontSize: 16
                        }}
                    >
                        {place.item.name}
                    </Text>
                    <Text>
                        {place.item.formatted_address}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    renderFlatList = () => {
        if (this.state.loading) {
            return (
                <ActivityIndicator
                    size="large"
                    style={{
                        flex: 1
                    }}
                />
            )
        }
        if (this.state.error != null) {
            return (
                Alert.alert(
                    'Atenção:',
                    this.state.error + "",
                    [
                        {
                            text: 'OK',
                            onPress: () => this.setState({ error: null })
                        },
                    ],
                    {
                        cancelable: true,
                        onPress: () => this.setState({ error: null })
                    }
                )
            )
        }
        return (
            <ScrollView>
                <FlatList
                    data={this.state.places}
                    renderItem={this.renderItem}
                    keyExtractor={(item) => item.id}
                />
            </ScrollView>
        )
    }

    renderModal = () => {
        if (this.state.modal) {
            return (
                <Modal
                    visible={this.state.modal}
                    transparent={false}
                    onRequestClose={() => {
                        this.setState({
                            modal: false,
                            place: null
                        });
                    }}
                    style={{
                        backgroundColor: "#FFF",
                        flex: 1
                    }}
                >
                    {this.renderPlace()}
                </Modal>
            )
        }

    }

    renderPlace = () => {
        if (this.state.loading) {
            return (
                <ActivityIndicator
                    size="large"
                    style={{
                        flex: 1
                    }}
                />
            )
        }
        if (this.state.error != null) {
            return (
                Alert.alert(
                    'Atenção:',
                    this.state.error + "",
                    [
                        {
                            text: 'OK',
                            onPress: () => this.setState({ error: null })
                        },
                    ],
                    {
                        cancelable: true,
                        onPress: () => this.setState({ error: null })
                    }
                )
            )
        }

        let photo, map = null;
        const { height, width } = Dimensions.get('window');

        if (typeof this.state.place.photos != 'undefined') {
            photo = <Image
                style={{
                    width: "100%",
                    height: 200
                }}
                source={{
                    uri: PHOTO_URL + '?maxwidth=' + width + '&photoreference=' + this.state.place.photos[0]["photo_reference"] + '&key=' + PLACES_API_KEY
                }}
            />;
        }


        if (typeof this.state.place.geometry != 'undefined') {
            const { lat, lng } = this.state.place.geometry.location;
            map = <Image
                style={{
                    width: "100%",
                    height: 200,
                    marginTop: 15,
                    flex: 1
                }}
                source={{
                    uri: MAP_URL + '?markers=' + lat + ',' + lng + '&zoom=16&size=' + width + 'x200&key=' + MAPS_API_KEY
                }}
            />;
        }
        return (
            <View
                style={{
                    flex: 1
                }}
            >
                <Button
                    title="Fechar"
                    onPress={() => {
                        this.setState({
                            modal: false,
                            place: null
                        });
                    }}
                    color={"#4db6ac"}
                />
                {photo}
                <View
                    style={{
                        padding: 15,
                        backgroundColor: "#FFF",
                        flex: 1
                    }}
                >
                    <Text
                        style={{
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 5
                        }}
                    >
                        {this.state.place.name} - {this.state.place.rating}
                    </Text>
                    <Text>
                        {this.state.place.formatted_address}
                    </Text>
                    <Text
                        style={{
                            fontWeight: "bold"
                        }}
                    >
                        {this.state.place.formatted_phone_number}
                    </Text>
                    {map}
                </View>
            </View>
        )
    }

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: "column",
                    backgroundColor: "#F1F1F1",
                    padding: 15
                }}
            >
                {this.renderForm()}
                {this.renderFlatList()}
                {this.renderModal()}
            </View>
        )
    }

}

AppRegistry.registerComponent('guia', () => App);